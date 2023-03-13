use std::{
    cmp::{Eq, PartialEq},
    collections::HashMap,
    hash::Hash,
    marker::PhantomData,
    ops::{Index, IndexMut},
};

#[derive(PartialEq, Hash)]
struct Id<T>(usize, PhantomData<T>)
where
    T: PartialEq + Hash;

impl<T> Eq for Id<T> where T: PartialEq + Hash {}

pub struct Sockets<T>(HashMap<Id<T>, T>)
where
    T: PartialEq + Hash;

impl<T> Index<Id<T>> for Sockets<T>
where
    T: PartialEq + Hash,
{
    type Output = T;

    fn index(&self, id: Id<T>) -> &Self::Output {
        self.0.get(&id).unwrap()
    }
}

impl<T> IndexMut<Id<T>> for Sockets<T>
where
    T: PartialEq + Hash,
{
    fn index_mut(&mut self, id: Id<T>) -> &mut Self::Output {
        self.0.get_mut(&id).unwrap()
    }
}
