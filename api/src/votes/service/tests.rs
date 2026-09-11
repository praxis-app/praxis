use chrono::{FixedOffset, TimeZone};

use super::ensure_before_voting_deadline;

fn timestamp(minute: u32) -> chrono::DateTime<FixedOffset> {
    FixedOffset::east_opt(0)
        .expect("UTC offset should be valid")
        .with_ymd_and_hms(2026, 6, 29, 12, minute, 0)
        .single()
        .expect("timestamp should be valid")
}

#[test]
fn vote_mutation_is_allowed_without_a_deadline() {
    assert!(ensure_before_voting_deadline(None, timestamp(5)).is_ok());
}

#[test]
fn vote_mutation_is_allowed_before_the_deadline() {
    assert!(
        ensure_before_voting_deadline(Some(timestamp(5)), timestamp(4)).is_ok()
    );
}

#[test]
fn vote_mutation_is_rejected_at_the_deadline() {
    let error = ensure_before_voting_deadline(Some(timestamp(5)), timestamp(5))
        .expect_err("the deadline should be exclusive");

    assert_eq!(
        error.to_string(),
        "409 Conflict: Voting deadline has passed."
    );
}

#[test]
fn vote_mutation_is_rejected_after_the_deadline() {
    let error = ensure_before_voting_deadline(Some(timestamp(5)), timestamp(6))
        .expect_err("a passed deadline should reject vote mutations");

    assert_eq!(
        error.to_string(),
        "409 Conflict: Voting deadline has passed."
    );
}
