use std::ops::Range;

pub(super) const MIN_QUERY_CHARS: usize = 2;
pub(super) const MAX_QUERY_CHARS: usize = 200;
pub(super) const MAX_EXCERPT_CHARS: usize = 200;

const ELLIPSIS: char = '…';

pub(super) fn normalize(value: &str) -> String {
    let mut normalized = String::with_capacity(value.len());
    for character in collapse_whitespace(value) {
        normalized.extend(character.to_lowercase());
    }
    normalized
}

pub(super) fn match_excerpt(value: &str, needle: &str) -> Option<String> {
    if needle.is_empty() {
        return None;
    }

    let display = collapse_whitespace(value);
    let mut normalized = String::with_capacity(value.len());
    let mut normalized_to_display = Vec::with_capacity(display.len());
    for (index, character) in display.iter().enumerate() {
        for lowered in character.to_lowercase() {
            normalized.push(lowered);
            normalized_to_display.push(index);
        }
    }

    let byte_offset = normalized.find(needle)?;
    let match_start =
        normalized_to_display[normalized[..byte_offset].chars().count()];
    let match_end = normalized_to_display
        .get(
            byte_offset_to_char_index(&normalized, byte_offset)
                + needle.chars().count(),
        )
        .copied()
        .unwrap_or(display.len())
        .clamp(match_start + 1, display.len());

    Some(excerpt(&display, match_start..match_end))
}

fn byte_offset_to_char_index(value: &str, byte_offset: usize) -> usize {
    value[..byte_offset].chars().count()
}

fn collapse_whitespace(value: &str) -> Vec<char> {
    let mut collapsed = Vec::with_capacity(value.len());
    let mut pending_space = false;

    for character in value.chars() {
        if character.is_whitespace() {
            pending_space = !collapsed.is_empty();
            continue;
        }
        if std::mem::take(&mut pending_space) {
            collapsed.push(' ');
        }
        collapsed.push(character);
    }
    collapsed
}

fn excerpt(display: &[char], matched: Range<usize>) -> String {
    if display.len() <= MAX_EXCERPT_CHARS {
        return display.iter().collect();
    }

    let mut text_budget = MAX_EXCERPT_CHARS;
    let mut window = centered_window(display.len(), &matched, text_budget);
    for _ in 0..2 {
        let remaining_budget =
            MAX_EXCERPT_CHARS - ellipsis_count(display.len(), &window);
        if remaining_budget == text_budget {
            break;
        }
        text_budget = remaining_budget;
        window = centered_window(display.len(), &matched, text_budget);
    }
    let window = window.start
        ..window.end.min(
            window.start + MAX_EXCERPT_CHARS
                - ellipsis_count(display.len(), &window),
        );

    let mut excerpt = String::new();
    if window.start > 0 {
        excerpt.push(ELLIPSIS);
    }
    excerpt.extend(&display[window.start..window.end]);
    if window.end < display.len() {
        excerpt.push(ELLIPSIS);
    }
    excerpt
}

fn centered_window(
    length: usize,
    matched: &Range<usize>,
    budget: usize,
) -> Range<usize> {
    let match_length = (matched.end - matched.start).min(budget);
    let lead = (budget - match_length) / 2;
    let start = matched.start.saturating_sub(lead).min(length - budget);

    start..start + budget
}

fn ellipsis_count(length: usize, window: &Range<usize>) -> usize {
    usize::from(window.start > 0) + usize::from(window.end < length)
}
