use std::{
    collections::{BTreeMap, BTreeSet, HashSet},
    fs,
    io::IsTerminal,
    path::{Path, PathBuf},
};

use anyhow::{Context, Result};
use owo_colors::OwoColorize;

use crate::args::RoutesArgs;

pub(crate) fn run(args: RoutesArgs) -> Result<()> {
    let color = std::io::stdout().is_terminal();
    let api_src = find_api_src_dir()?;
    let mut registry = RouteRegistry::new(api_src.clone());

    registry.parse_lib()?;
    for file_path in route_files(&api_src)? {
        registry.parse_routes_file(&file_path)?;
    }

    let mut routes = registry.routes();
    routes.sort_by(|a, b| {
        route_section(&a.path)
            .cmp(&route_section(&b.path))
            .then(a.path.cmp(&b.path))
            .then(a.method.cmp(&b.method))
            .then(a.handler.cmp(&b.handler))
    });
    routes.dedup_by(|a, b| {
        a.method == b.method
            && a.path == b.path
            && a.handler == b.handler
            && a.source == b.source
    });

    if let Some(filter) = args.path.as_deref() {
        routes.retain(|route| route.path.contains(filter));
    }

    if routes.is_empty() {
        println!("No routes found.");
        return Ok(());
    }

    if args.tree {
        print_tree(&routes, color);
    } else {
        print_flat(&routes, color);
    }

    Ok(())
}

#[derive(Debug, Clone, Eq, PartialEq)]
struct RouteInfo {
    method: String,
    path: String,
    handler: String,
    source: String,
}

#[derive(Debug, Default)]
struct RouterInfo {
    routes: Vec<RouteInfo>,
    mounts: Vec<MountInfo>,
}

#[derive(Debug)]
struct MountInfo {
    prefix: String,
    module: String,
}

struct RouteRegistry {
    api_src: PathBuf,
    routers: BTreeMap<String, RouterInfo>,
    roots: Vec<MountInfo>,
}

impl RouteRegistry {
    fn new(api_src: PathBuf) -> Self {
        Self {
            api_src,
            routers: BTreeMap::new(),
            roots: Vec::new(),
        }
    }

    fn parse_lib(&mut self) -> Result<()> {
        let file_path = self.api_src.join("lib.rs");
        let content = read_source(&file_path)?;
        let source = display_source(&self.api_src, &file_path);

        for call in extract_calls(&content, ".route(") {
            let args = split_top_level_args(&call);
            if args.len() < 2 {
                continue;
            }

            let Some(path) = string_literal(args[0]) else {
                continue;
            };

            for (method, handler) in extract_methods(args[1]) {
                if path == "/ws" {
                    self.roots.push(MountInfo {
                        prefix: path.clone(),
                        module: "__ws__".to_owned(),
                    });
                    self.routers
                        .entry("__ws__".to_owned())
                        .or_default()
                        .routes
                        .push(RouteInfo {
                            method,
                            path: String::new(),
                            handler,
                            source: source.clone(),
                        });
                } else if path == "/health" {
                    self.routers
                        .entry("health".to_owned())
                        .or_default()
                        .routes
                        .push(RouteInfo {
                            method,
                            path: path.clone(),
                            handler,
                            source: source.clone(),
                        });
                }
            }
        }

        if content.contains(".nest(\"/api\"")
            || content.contains(".nest(\"/api\",")
        {
            self.roots.push(MountInfo {
                prefix: "/api".to_owned(),
                module: "__api__".to_owned(),
            });
        }

        let api_router = self.routers.entry("__api__".to_owned()).or_default();
        api_router.mounts.push(MountInfo {
            prefix: String::new(),
            module: "health".to_owned(),
        });

        for call in extract_calls(&content, ".merge(") {
            if let Some(module) =
                router_module_from_expr(&call, "", &self.api_src)
            {
                api_router.mounts.push(MountInfo {
                    prefix: String::new(),
                    module,
                });
            }
        }

        Ok(())
    }

    fn parse_routes_file(&mut self, file_path: &Path) -> Result<()> {
        let module = module_key(&self.api_src, file_path)?;
        let module_dir = module.clone();
        let content = read_source(file_path)?;
        let source = display_source(&self.api_src, file_path);
        let mut router = RouterInfo::default();

        for call in extract_calls(&content, ".route(") {
            let args = split_top_level_args(&call);
            if args.len() < 2 {
                continue;
            }

            let Some(path) = string_literal(args[0]) else {
                continue;
            };

            for (method, handler) in extract_methods(args[1]) {
                router.routes.push(RouteInfo {
                    method,
                    path: path.clone(),
                    handler,
                    source: source.clone(),
                });
            }
        }

        for call in extract_calls(&content, ".nest(") {
            let args = split_top_level_args(&call);
            if args.len() < 2 {
                continue;
            }

            let Some(prefix) = string_literal(args[0]) else {
                continue;
            };

            if let Some(child) =
                router_module_from_expr(args[1], &module_dir, &self.api_src)
            {
                router.mounts.push(MountInfo {
                    prefix,
                    module: child,
                });
            }
        }

        for call in extract_calls(&content, ".merge(") {
            if let Some(child) =
                router_module_from_expr(&call, &module_dir, &self.api_src)
            {
                router.mounts.push(MountInfo {
                    prefix: String::new(),
                    module: child,
                });
            }
        }

        let existing = self.routers.entry(module).or_default();
        existing.routes.extend(router.routes);
        existing.mounts.extend(router.mounts);

        Ok(())
    }

    fn routes(&self) -> Vec<RouteInfo> {
        let mut routes = Vec::new();
        for root in &self.roots {
            self.collect_routes(root, "", &mut HashSet::new(), &mut routes);
        }
        routes
    }

    fn collect_routes(
        &self,
        mount: &MountInfo,
        prefix: &str,
        visited: &mut HashSet<String>,
        routes: &mut Vec<RouteInfo>,
    ) {
        let current_path = join_paths(prefix, &mount.prefix);
        if !visited.insert(mount.module.clone()) {
            return;
        }

        if let Some(router) = self.routers.get(&mount.module) {
            for route in &router.routes {
                let mut route = route.clone();
                route.path = join_paths(&current_path, &route.path);
                routes.push(route);
            }

            for child in &router.mounts {
                self.collect_routes(child, &current_path, visited, routes);
            }
        }

        visited.remove(&mount.module);
    }
}

fn find_api_src_dir() -> Result<PathBuf> {
    let cwd = std::env::current_dir()?;
    for candidate in [
        cwd.join("api/src"),
        cwd.join("../api/src"),
        cwd.join("../../api/src"),
    ] {
        if candidate.join("lib.rs").exists() {
            return Ok(candidate.canonicalize()?);
        }
    }

    anyhow::bail!(
        "Could not find api/src. Run from the repository root or cli/ directory."
    );
}

fn route_files(api_src: &Path) -> Result<Vec<PathBuf>> {
    fn visit(dir: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
        for entry in fs::read_dir(dir)
            .with_context(|| format!("failed to read {}", dir.display()))?
        {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                visit(&path, files)?;
            } else if path.file_name().is_some_and(|name| name == "routes.rs") {
                files.push(path);
            }
        }

        Ok(())
    }

    let mut files = Vec::new();
    visit(api_src, &mut files)?;
    files.sort();
    Ok(files)
}

fn read_source(file_path: &Path) -> Result<String> {
    fs::read_to_string(file_path)
        .with_context(|| format!("failed to read {}", file_path.display()))
}

fn module_key(api_src: &Path, file_path: &Path) -> Result<String> {
    let relative = file_path.strip_prefix(api_src).with_context(|| {
        format!("{} is not under api/src", file_path.display())
    })?;
    let parent = relative
        .parent()
        .context("routes.rs should have a parent")?;

    Ok(parent
        .components()
        .map(|component| component.as_os_str().to_string_lossy())
        .collect::<Vec<_>>()
        .join("/"))
}

fn display_source(api_src: &Path, file_path: &Path) -> String {
    let api_dir = api_src.parent().unwrap_or(api_src);
    file_path
        .strip_prefix(api_dir)
        .map(|path| format!("api/{}", path.display()))
        .unwrap_or_else(|_| file_path.display().to_string())
}

fn extract_calls(content: &str, marker: &str) -> Vec<String> {
    let mut calls = Vec::new();
    let mut offset = 0;

    while let Some(relative_start) = content[offset..].find(marker) {
        let open = offset + relative_start + marker.len() - 1;
        if let Some(close) = matching_paren(content, open) {
            calls.push(content[open + 1..close].to_owned());
            offset = close + 1;
        } else {
            break;
        }
    }

    calls
}

fn matching_paren(content: &str, open: usize) -> Option<usize> {
    let mut depth = 0;
    let mut quote = None;
    let mut escape = false;

    for (idx, ch) in content.char_indices().skip_while(|(idx, _)| *idx < open) {
        if let Some(quote_char) = quote {
            if escape {
                escape = false;
            } else if ch == '\\' {
                escape = true;
            } else if ch == quote_char {
                quote = None;
            }
            continue;
        }

        match ch {
            '"' | '\'' => quote = Some(ch),
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(idx);
                }
            }
            _ => {}
        }
    }

    None
}

fn split_top_level_args(input: &str) -> Vec<&str> {
    let mut args = Vec::new();
    let mut start = 0;
    let mut paren_depth = 0;
    let mut brace_depth = 0;
    let mut quote = None;
    let mut escape = false;

    for (idx, ch) in input.char_indices() {
        if let Some(quote_char) = quote {
            if escape {
                escape = false;
            } else if ch == '\\' {
                escape = true;
            } else if ch == quote_char {
                quote = None;
            }
            continue;
        }

        match ch {
            '"' | '\'' => quote = Some(ch),
            '(' => paren_depth += 1,
            ')' => paren_depth -= 1,
            '{' => brace_depth += 1,
            '}' => brace_depth -= 1,
            ',' if paren_depth == 0 && brace_depth == 0 => {
                args.push(input[start..idx].trim());
                start = idx + 1;
            }
            _ => {}
        }
    }

    let tail = input[start..].trim();
    if !tail.is_empty() {
        args.push(tail);
    }

    args
}

fn string_literal(input: &str) -> Option<String> {
    let trimmed = input.trim();
    let quote = trimmed.chars().next()?;
    if quote != '"' && quote != '\'' {
        return None;
    }

    let mut value = String::new();
    let mut escape = false;
    for ch in trimmed[1..].chars() {
        if escape {
            value.push(ch);
            escape = false;
        } else if ch == '\\' {
            escape = true;
        } else if ch == quote {
            return Some(value);
        } else {
            value.push(ch);
        }
    }

    None
}

fn extract_methods(input: &str) -> Vec<(String, String)> {
    let mut methods = Vec::new();
    let method_names = ["get", "post", "put", "delete", "patch"];
    let bytes = input.as_bytes();
    let mut idx = 0;

    while idx < input.len() {
        let Some((method, name_start)) =
            find_next_method(input, idx, &method_names)
        else {
            break;
        };
        let open = name_start + method.len();
        let Some(close) = matching_paren(input, open) else {
            idx = open + 1;
            continue;
        };

        let args = split_top_level_args(&input[open + 1..close]);
        let handler = args
            .first()
            .map(|handler| handler.trim())
            .filter(|handler| !handler.is_empty())
            .map(clean_handler)
            .unwrap_or_else(|| "?".to_owned());

        methods.push((method.to_uppercase(), handler));
        idx = close + 1;

        while idx < bytes.len() && bytes[idx].is_ascii_whitespace() {
            idx += 1;
        }
    }

    methods
}

fn find_next_method(
    input: &str,
    start: usize,
    method_names: &[&str],
) -> Option<(String, usize)> {
    let mut best: Option<(&str, usize)> = None;

    for method in method_names {
        for marker in [format!("{method}("), format!(".{method}(")] {
            if let Some(relative) = input[start..].find(&marker) {
                let idx =
                    start + relative + usize::from(marker.starts_with('.'));
                if is_method_boundary(input, idx) {
                    match best {
                        Some((_, best_idx)) if best_idx <= idx => {}
                        _ => best = Some((*method, idx)),
                    }
                }
            }
        }
    }

    best.map(|(method, idx)| (method.to_owned(), idx))
}

fn is_method_boundary(input: &str, idx: usize) -> bool {
    let previous = input[..idx].chars().next_back();
    previous.is_none_or(|ch| {
        ch == '.' || ch.is_whitespace() || ch == '(' || ch == ','
    })
}

fn clean_handler(input: &str) -> String {
    let without_state = input
        .split(".with_state")
        .next()
        .unwrap_or(input)
        .trim()
        .trim_end_matches(',');

    without_state
        .trim_start_matches("handlers::")
        .trim_start_matches("super::handlers::")
        .to_owned()
}

fn router_module_from_expr(
    input: &str,
    module_dir: &str,
    api_src: &Path,
) -> Option<String> {
    let expr = input.trim();
    if expr.starts_with("Router::new") {
        return None;
    }

    let before_router = expr.split("::router").next()?;
    let first_line = before_router
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())?;
    let module = first_line
        .trim_start_matches("crate::")
        .trim_start_matches("super::")
        .trim();

    if module.is_empty() || module.contains(' ') || module.contains('(') {
        return None;
    }

    let module = module.replace("::routes", "").replace("::", "/");
    Some(resolve_module_path(&module, module_dir, api_src))
}

fn resolve_module_path(
    module: &str,
    module_dir: &str,
    api_src: &Path,
) -> String {
    if module.contains('/') || module_dir.is_empty() {
        return module.to_owned();
    }

    let root_routes = api_src.join(module).join("routes.rs");
    if root_routes.exists() {
        module.to_owned()
    } else {
        format!("{module_dir}/{module}")
    }
}

fn join_paths(prefix: &str, path: &str) -> String {
    let joined = if prefix.is_empty() {
        path.to_owned()
    } else if path.is_empty() || path == "/" {
        prefix.to_owned()
    } else {
        format!(
            "{}/{}",
            prefix.trim_end_matches('/'),
            path.trim_start_matches('/')
        )
    };

    normalize_path(&joined)
}

fn normalize_path(path: &str) -> String {
    let mut normalized = path.replace("//", "/");
    while normalized.len() > 1 && normalized.ends_with('/') {
        normalized.pop();
    }

    if normalized.is_empty() {
        "/".to_owned()
    } else {
        rust_params_to_legacy(&normalized)
    }
}

fn print_flat(routes: &[RouteInfo], color: bool) {
    if color {
        println!("\n{}", "API Routes".bold().underline());
    } else {
        println!("\nAPI Routes");
    }

    let mut current_section = Vec::new();
    for route in routes {
        let section = route_section(&route.path);
        if section != current_section {
            current_section = section;
            print_section_header(&current_section, color);
        }

        if color {
            println!(
                "    {:<8} {} {} {}",
                colorize_method(&route.method),
                route.path,
                "→".dimmed(),
                route.handler.dimmed()
            );
        } else {
            println!(
                "    {:<8} {} -> {}",
                route.method, route.path, route.handler
            );
        }
    }

    print_count(routes.len(), color);
}

fn print_section_header(section: &[String], color: bool) {
    if color {
        let parts = section
            .iter()
            .enumerate()
            .map(|(index, part)| {
                if index + 1 == section.len() {
                    part.bold().to_string()
                } else {
                    part.dimmed().to_string()
                }
            })
            .collect::<Vec<_>>();
        println!("\n  {}", parts.join(&" > ".dimmed().to_string()));
    } else {
        println!("\n  {}", section.join(" > "));
    }
}

fn route_section(path: &str) -> Vec<String> {
    let segments = path
        .trim_start_matches('/')
        .split('/')
        .filter(|segment| !segment.is_empty())
        .collect::<Vec<_>>();

    if segments.first() == Some(&"ws") {
        return vec!["ws".to_owned()];
    }

    let resource = segments.get(1).copied().unwrap_or("root");
    match resource {
        "auth" | "health" | "invites" | "users" => vec![resource.to_owned()],
        "instance" => instance_section(&segments),
        "servers" => server_section(&segments),
        _ => vec![resource.to_owned()],
    }
}

fn instance_section(segments: &[&str]) -> Vec<String> {
    if !segments.contains(&"roles") {
        return vec!["instance".to_owned()];
    }

    if segments.contains(&"members") {
        vec![
            "instance".to_owned(),
            "roles".to_owned(),
            "members".to_owned(),
        ]
    } else if segments.contains(&"permissions") {
        vec![
            "instance".to_owned(),
            "roles".to_owned(),
            "permissions".to_owned(),
        ]
    } else {
        vec!["instance".to_owned(), "roles".to_owned()]
    }
}

fn server_section(segments: &[&str]) -> Vec<String> {
    if segments.contains(&"channels") {
        if segments.contains(&"messages") {
            vec![
                "servers".to_owned(),
                "channels".to_owned(),
                "messages".to_owned(),
            ]
        } else if segments.contains(&"votes") {
            vec![
                "servers".to_owned(),
                "channels".to_owned(),
                "polls".to_owned(),
                "votes".to_owned(),
            ]
        } else if segments.contains(&"polls") {
            vec![
                "servers".to_owned(),
                "channels".to_owned(),
                "polls".to_owned(),
            ]
        } else {
            vec!["servers".to_owned(), "channels".to_owned()]
        }
    } else if segments.contains(&"configs") {
        vec!["servers".to_owned(), "configs".to_owned()]
    } else if segments.contains(&"roles") {
        if segments.contains(&"members") {
            vec![
                "servers".to_owned(),
                "roles".to_owned(),
                "members".to_owned(),
            ]
        } else if segments.contains(&"permissions") {
            vec![
                "servers".to_owned(),
                "roles".to_owned(),
                "permissions".to_owned(),
            ]
        } else {
            vec!["servers".to_owned(), "roles".to_owned()]
        }
    } else if segments.contains(&"invites") {
        vec!["servers".to_owned(), "invites".to_owned()]
    } else if segments.contains(&"members") {
        vec!["servers".to_owned(), "members".to_owned()]
    } else {
        vec!["servers".to_owned()]
    }
}

fn rust_params_to_legacy(path: &str) -> String {
    let mut converted = String::with_capacity(path.len());
    let mut chars = path.chars().peekable();

    while let Some(ch) = chars.next() {
        if ch == '{' {
            converted.push(':');
            for inner in chars.by_ref() {
                if inner == '}' {
                    break;
                }
                converted.push(inner);
            }
        } else {
            converted.push(ch);
        }
    }

    converted
}

fn print_tree(routes: &[RouteInfo], color: bool) {
    if color {
        println!("\n{}", "API Route Tree".bold().underline());
    } else {
        println!("\nAPI Route Tree");
    }

    let mut tree = RouteTree::default();
    for route in routes {
        tree.insert(route);
    }
    tree.print("/", 0, color);
    print_count(routes.len(), color);
}

fn print_count(count: usize, color: bool) {
    if color {
        println!("\n{} {}", count.bold(), "routes total".dimmed());
    } else {
        println!("\n{} routes total", count);
    }
}

fn colorize_method(method: &str) -> String {
    match method {
        "GET" => method.green().bold().to_string(),
        "POST" => method.yellow().bold().to_string(),
        "PUT" => method.blue().bold().to_string(),
        "DELETE" => method.red().bold().to_string(),
        "PATCH" => method.magenta().bold().to_string(),
        _ => method.to_owned(),
    }
}

#[derive(Default)]
struct RouteTree {
    routes: Vec<RouteInfo>,
    children: BTreeMap<String, RouteTree>,
}

impl RouteTree {
    fn insert(&mut self, route: &RouteInfo) {
        let mut node = self;
        for segment in
            route.path.split('/').filter(|segment| !segment.is_empty())
        {
            node = node.children.entry(segment.to_owned()).or_default();
        }
        node.routes.push(route.clone());
    }

    fn print(&self, label: &str, depth: usize, color: bool) {
        let indent = "  ".repeat(depth);
        if color {
            println!("{}{}", indent, label.bold());
        } else {
            println!("{indent}{label}");
        }

        let mut seen = BTreeSet::new();
        for route in &self.routes {
            if seen.insert((route.method.clone(), route.handler.clone())) {
                if color {
                    println!(
                        "{}  {:<8} {}",
                        indent,
                        colorize_method(&route.method),
                        route.handler
                    );
                } else {
                    println!(
                        "{}  {:<8} {}",
                        indent, route.method, route.handler
                    );
                }
            }
        }

        for (segment, child) in &self.children {
            child.print(segment, depth + 1, color);
        }
    }
}
