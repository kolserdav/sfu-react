use dotenvy::{from_path, Result as DotenvResult};
use once_cell::sync::Lazy;
use std::{env::current_dir, ffi::OsStr, path::PathBuf};

pub static PORT: Lazy<u16> = Lazy::new(|| {
    std::env::var("PORT")
        .expect("PORT must be set.")
        .parse::<u16>()
        .expect("PORT must be integer")
});

pub static HOST: Lazy<String> = Lazy::new(|| std::env::var("HOST").expect("HOST must be set."));

pub fn dotenv_init() -> DotenvResult<()> {
    let path = PathBuf::from(file!());

    #[cfg(not(test))]
    let dir = path.parent().unwrap().parent().unwrap().parent().unwrap();

    #[cfg(test)]
    let dir = path
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap();

    let path_raw = format!("{:?}/{:?}/.env", current_dir().unwrap(), dir).replace("\"", "");
    let dotenv_f = OsStr::new(&path_raw);

    #[cfg(not(test))]
    println!("Dotenv file: {:?}", &dotenv_f);

    from_path(dotenv_f)
}

pub const DELIMITER: char = '_';

pub const BLOCK_DURATION_MS: u64 = 100;
