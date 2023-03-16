use tokio::sync::MutexGuard;

#[derive(Debug)]
pub struct Room<T>
where
    T: std::fmt::Debug,
{
    pub room_id: String,
    pub users: Vec<T>,
}

pub type RoomsMutex<'a, T> = MutexGuard<'a, Vec<Room<T>>>;
