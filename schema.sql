create table user(
      firstname varchar(100),
      familyname varchar(100),
      gender varchar(100),
      city varchar(100),
      country varchar(100),
      email varchar(100),
      password varchar(100),
      primary key(email)
);
 

 create table token_data(token varchar(100),
       email varchar(100),
       primary key(email));
 

create table messages(
      sender varchar(100),
      receiver varchar(100),
      message_data text,
      foreign key(sender) references user(email),
      foreign key(receiver) references user(email)
)