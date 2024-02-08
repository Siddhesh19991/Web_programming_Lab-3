import sqlite3
from flask import g


database_uri = "database.db"


def get_db():
    db = getattr(g, "db", None)  # To check if there is a database or not
    if db is None:
        db = g.db = sqlite3.connect(database_uri)

    return db


def disconnect():
    db = getattr(g, "db", None)
    if db is not None:
        db.close()
        g.db = None


def create_user(fname, lname, gender, city, country, email, password):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("INSERT INTO user (firstname, familyname, gender, city, country, email,password) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (fname, lname, gender, city, country, email, password))
        get_db().commit()

        return True
    except:
        return False


def add_user_token_table(email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO token_data (email) VALUES (?)", (email,))
    get_db().commit()


def find_user(email):
    db = get_db()
    cursor = db.cursor()
    cursor = db.execute(
        "select * from  user where email like  ?", [email])
    data = cursor.fetchone()

    # print(data)

    if (data != None):
        return True
    else:
        return False


def user_check(email):
    db = get_db()
    cursor = db.cursor()
    cursor = db.execute(
        "select password from  user where email like  ?", [email])
    password_data = cursor.fetchone()[0]
    # print(password_data)

    return (password_data)


def token_store(email, token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE token_data SET token = ? WHERE email = ?", (token, email))
    get_db().commit()


def get_token(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("select * from token_data where token like ?", (token,))
    token_value = cursor.fetchone()

    # print(token_value)

    if (token_value != None):
        return True
    else:
        return False


def remove_token(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        # if it is () with one value then we need to put comma, it we use [] then we dont need to put comma
        "update token_data set token = NULL where token = ?", (token,))
    get_db().commit()


def get_email(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("select email from token_data where token like ?", [token])
    email_value = cursor.fetchone()[0]

    return (email_value)


def update_password(password, email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("update user set password = ? where email = ?", [
                   password, email])
    get_db().commit()


def append_message(email, message):
    db = get_db()
    cursor = db.cursor()
    all_msgs = cursor.execute(
        "select messages from user where email = ?", [email])
    all_msgs = all_msgs.fetchall()

    new_msgs = []

    for row in all_msgs:
        # Create a new list by combining the existing tuple with the new message
        new_row = list(row) + [message]
        # Append the new list to new_msgs
        new_msgs.append(new_row)

    print(new_msgs)

    # all_msgs = all_msgs.append(message)

    ############ Why cant I do cursor.execute twice in the same function? #####################

    # cursor.execute("update user set messages = ? where email = ?", [
    #    all_msgs, email])
    # get_db().commit()

    return (new_msgs)


def push_message(email, message):
    db = get_db()
    cursor = db.cursor()

    message = ';'.join(map(str, message[0]))  # changed from "," to ";"

    cursor.execute("update user set messages = ? where email = ?", [
                   message, email])
    get_db().commit()


def get_message(email):
    db = get_db()
    cursor = db.cursor()
    all_msgs = cursor.execute(
        "select messages from user where email = ?", [email])
    all_msgs = all_msgs.fetchall()

    return (all_msgs)


def get_user_data_with_token(token): # get user data with token from database
    db = get_db()
    cursor = db.cursor()  # sqlite internal function to execute the query
    cursor.execute(
        """
        select
            firstname,
            familyname,
            gender,
            city,
            country,
            email
        from
            user
        where
            email = (select email from token_data where token = ?)
        """,
        [token])
    #fetchone returns None if there is no data
    user_data = cursor.fetchone() # just to get one row from the database.to be safe
    return user_data
