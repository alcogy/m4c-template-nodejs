CREATE TABLE account (
  id serial primary key,
  name varchar(128) not null default '',
  email varchar(255) not null default '',
  password varchar(255) not null default '',
  salt varchar(64) not null default ''
);
