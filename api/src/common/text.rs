const SAFE_URL_SCHEMES: [&str; 3] = ["http", "https", "mailto"];

pub(crate) fn sanitize_text(value: &str) -> String {
    sanitize_markdown_links(&strip_tags(value))
}

fn strip_tags(value: &str) -> String {
    let mut sanitized = String::with_capacity(value.len());
    let mut characters = value.trim().chars().peekable();
    while let Some(character) = characters.next() {
        if character != '<' {
            sanitized.push(character);
            continue;
        }

        let mut possible_tag = String::from("<");
        let mut found_tag_end = false;
        for character in characters.by_ref() {
            possible_tag.push(character);
            if character == '>' {
                found_tag_end = true;
                break;
            }
        }

        if !found_tag_end {
            sanitized.push_str(&possible_tag);
        }
    }
    sanitized
}

fn sanitize_markdown_links(value: &str) -> String {
    let mut sanitized = String::with_capacity(value.len());
    let mut rest = value;

    // Terminates: `rest` shrinks past each "](" match
    while let Some(offset) = rest.find("](") {
        let (head, destination) = rest.split_at(offset + 2);
        sanitized.push_str(head);
        if !is_safe_destination(destination) {
            sanitized.push('#');
        }
        rest = destination;
    }

    sanitized.push_str(rest);
    sanitized
}

fn is_safe_destination(value: &str) -> bool {
    let destination: String = value
        .chars()
        .take_while(|character| *character != ')')
        .filter(|character| {
            !character.is_whitespace() && !character.is_control()
        })
        .collect();

    let Some((scheme, _)) = destination.split_once(':') else {
        return true;
    };
    scheme.contains('/')
        || SAFE_URL_SCHEMES
            .iter()
            .any(|safe| scheme.eq_ignore_ascii_case(safe))
}

pub(crate) fn normalize_text(value: &str) -> String {
    value.trim().to_ascii_lowercase()
}
