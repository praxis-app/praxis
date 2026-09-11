use std::env;

use base64::{engine::general_purpose::STANDARD, Engine as _};
use ring::{
    aead::{Aad, LessSafeKey, Nonce, UnboundKey, AES_256_GCM},
    rand::{SecureRandom, SystemRandom},
};

use super::{ApiError, AppResult};

const AES_256_GCM_KEY_LENGTH: usize = 32;
const AES_256_GCM_IV_LENGTH: usize = 12;

#[derive(Debug, Clone)]
pub(crate) struct EncryptedBytes {
    pub(crate) ciphertext: Vec<u8>,
    pub(crate) iv: Vec<u8>,
    pub(crate) tag: Vec<u8>,
}

pub(crate) fn generate_channel_key() -> AppResult<EncryptedBytes> {
    let channel_key = random_bytes(AES_256_GCM_KEY_LENGTH)?;
    encrypt_bytes(&channel_key, &channel_key_master()?)
}

pub(crate) fn unwrap_channel_key(
    wrapped_key: &[u8],
    iv: &[u8],
    tag: &[u8],
) -> AppResult<Vec<u8>> {
    decrypt_bytes(wrapped_key, iv, tag, &channel_key_master()?)
}

pub(crate) fn encrypt_text(
    plaintext: &str,
    key: &[u8],
) -> AppResult<EncryptedBytes> {
    encrypt_bytes(plaintext.as_bytes(), key)
}

pub(crate) fn decrypt_text(
    ciphertext: &[u8],
    iv: &[u8],
    tag: &[u8],
    key: &[u8],
) -> AppResult<String> {
    let bytes = decrypt_bytes(ciphertext, iv, tag, key)?;
    String::from_utf8(bytes).map_err(|_| encryption_error("Invalid plaintext."))
}

fn encrypt_bytes(plaintext: &[u8], key: &[u8]) -> AppResult<EncryptedBytes> {
    let key = aead_key(key)?;
    let iv = random_bytes(AES_256_GCM_IV_LENGTH)?;
    let nonce = nonce_from_slice(&iv)?;
    let mut in_out = plaintext.to_vec();
    let tag = key
        .seal_in_place_separate_tag(nonce, Aad::empty(), &mut in_out)
        .map_err(|_| encryption_error("Encryption failed."))?;

    Ok(EncryptedBytes {
        ciphertext: in_out,
        iv,
        tag: tag.as_ref().to_vec(),
    })
}

fn decrypt_bytes(
    ciphertext: &[u8],
    iv: &[u8],
    tag: &[u8],
    key: &[u8],
) -> AppResult<Vec<u8>> {
    let key = aead_key(key)?;
    let nonce = nonce_from_slice(iv)?;
    let tag = ring::aead::Tag::try_from(tag)
        .map_err(|_| encryption_error("Invalid authentication tag."))?;
    let mut in_out = ciphertext.to_vec();
    let plaintext = key
        .open_in_place_separate_tag(nonce, Aad::empty(), tag, &mut in_out, 0..)
        .map_err(|_| encryption_error("Decryption failed."))?;

    Ok(plaintext.to_vec())
}

fn aead_key(key: &[u8]) -> AppResult<LessSafeKey> {
    let unbound = UnboundKey::new(&AES_256_GCM, key)
        .map_err(|_| encryption_error("Invalid encryption key."))?;
    Ok(LessSafeKey::new(unbound))
}

fn nonce_from_slice(iv: &[u8]) -> AppResult<Nonce> {
    let iv: [u8; AES_256_GCM_IV_LENGTH] = iv
        .try_into()
        .map_err(|_| encryption_error("Invalid initialization vector."))?;
    Ok(Nonce::assume_unique_for_key(iv))
}

fn random_bytes(len: usize) -> AppResult<Vec<u8>> {
    let mut bytes = vec![0_u8; len];
    SystemRandom::new()
        .fill(&mut bytes)
        .map_err(|_| encryption_error("Random byte generation failed."))?;
    Ok(bytes)
}

fn channel_key_master() -> AppResult<Vec<u8>> {
    let encoded = env::var("CHANNEL_KEY_MASTER").map_err(|_| {
        encryption_error("CHANNEL_KEY_MASTER environment variable is not set.")
    })?;
    let key = STANDARD
        .decode(encoded)
        .map_err(|_| encryption_error("CHANNEL_KEY_MASTER is not base64."))?;

    if key.len() == AES_256_GCM_KEY_LENGTH {
        Ok(key)
    } else {
        Err(encryption_error(
            "CHANNEL_KEY_MASTER must decode to 32 bytes.",
        ))
    }
}

fn encryption_error(message: &str) -> ApiError {
    ApiError::new(axum::http::StatusCode::INTERNAL_SERVER_ERROR, message)
}
