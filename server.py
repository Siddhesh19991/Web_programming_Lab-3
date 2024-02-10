from flask import Flask, jsonify, request
import sqlite3
import database_helper
import secrets
from email_validator import validate_email, EmailNotValidError
import secrets


app = Flask(__name__)


@app.route("/sign_up", methods=["POST"])
def sign_up():
    json_dic = request.get_json()
    # print(json_dic)
    fname = json_dic["firstname"]
    lname = json_dic["familyname"]
    gender = json_dic["gender"]
    city = json_dic["city"]
    country = json_dic["country"]
    email = json_dic["email"]
    password = json_dic["password"]

    if fname == "" or lname == "" or gender == "" or city == "" or country == "" or email == "" or password == "":
        return jsonify({"success": "false", "msg": "no empty fields allowed"}), 200

    try:
        validate_email(email, check_deliverability=False)

    except:
        return jsonify({"success": "false", "msg": "incorrect structure of the email"}), 200

    if len(password) < 8:
        return jsonify({"success": "false", "msg": "password must be atleast 8 characters long"}), 200

    if (database_helper.find_user(email) == True):
        return jsonify({"success": "false", "msg": "user already exists"}), 200

    if password == "":
        return jsonify({"success": "false", "msg": "password cannot be empty"}), 200

    resp = database_helper.create_user(
        fname, lname, gender, city, country, email, password)

    if resp == False:
        return jsonify({"success": "false", "msg": "issue with creating the user"}), 200
    else:
        database_helper.add_user_token_table(email)
        return jsonify({"success": "true", "msg": "user created"}), 200


@app.route("/sign_in", methods=["POST"])
def sign_in():
    json_dic = request.get_json()
    email = json_dic["email"]
    password = json_dic["password"]

    token = secrets.token_hex(16)

    if (database_helper.find_user(email) == False):
        return jsonify({"success": "false", "msg": "user does not exist"}), 200

    password_check = database_helper.user_check(email)

    if password == password_check:
        database_helper.token_store(email, token)
        return jsonify({"success": "true", "token": token, "msg": "logged in successucfully", "email": email}), 200
    else:
        return jsonify({"success": "false", "msg": "incorrect password"}), 200


@app.route("/sign_out", methods=["POST"])
def sign_out():
    json_dic = request.get_json()

    token = json_dic["token"]

    token_database = database_helper.get_token(token)

    if token_database == True:
        database_helper.remove_token(token)
        return jsonify({"success": "true", "msg": "sign out successucful"}), 200
    else:
        return jsonify({"success": "false", "msg": "error with signing out"}), 200


@app.route("/change_password", methods=["POST"])
def change_password():
    json_dic = request.get_json()
    token = json_dic["token"]
    old_pass = json_dic["old_pass"]
    new_pass = json_dic["new_pass"]

    token_database = database_helper.get_token(token)

    email = database_helper.get_email(token)

    password_database = database_helper.user_check(email)

    password_check = old_pass == password_database

    if token_database == True and password_check == True:
        database_helper.update_password(new_pass, email)
        return jsonify({"success": "true", "msg": "password updated"}), 200
    else:
        return jsonify({"success": "false", "msg": "incorrect old password or token invalid"}), 200


@app.route("/get_user_data_by_token/<token>", methods=["GET"])
def get_user_data_by_token(token):
    # get the token from the header with authorization key
    # token = request.headers.get("authorization")
    user_data = database_helper.get_user_data_with_token(token)

    if user_data == None:
        return jsonify({"success": "false", "msg": "token invalid"}), 200

    received_data = {  # create a dictionary with the user data(json)
        "firstname": user_data[0],
        "familyname": user_data[1],
        "gender": user_data[2],
        "city": user_data[3],
        "country": user_data[4],
        "email": user_data[5]
    }
    # return the user data as a json
    return jsonify({"success": "true", "msg": "user data retrieved", "data": received_data}), 200


@app.route("/get_user_data_by_email/<email>", methods=["GET"])
def get_user_data_by_email(email):
    # check if the token is valid
    token = request.headers.get("authorization")
    token_user_data = database_helper.get_user_data_with_token(token)
    if token_user_data == None:
        return jsonify({"success": "false", "msg": "token invalid"}), 200

    # get the user data with the email
    email_user_data = database_helper.get_user_data_with_email(email)

    if email_user_data == None:
        return jsonify({"success": "false", "msg": "User with this email not found! Check the email."}), 200

    received_data = {
        "firstname": email_user_data[0],
        "familyname": email_user_data[1],
        "gender": email_user_data[2],
        "city": email_user_data[3],
        "country": email_user_data[4],
        "email": email_user_data[5]
    }
    return jsonify({"success": "true", "msg": "user data retrieved", "data": received_data}), 200


@app.route("/post_message", methods=["POST"])
def post_msg():
    json_dic = request.get_json()
    # token = request.headers.get("Authorization")
    token = json_dic["token"]
    email = json_dic["email"]
    message = json_dic["message"]

    # token = database_helper.find_token()
    # email = database_helper.find_email()

    if database_helper.get_token(token) == False:
        return jsonify({"success": "false", "msg": "token doesnt exist"}), 200

    if message == "":
        return jsonify({"success": "false", "msg": "messsage cannot be empty"}), 200

    if database_helper.find_user(email) == False:
        return jsonify({"success": "false", "msg": "email doesnt exist"}), 200

    a = database_helper.append_message(email, message)

    database_helper.push_message(email, a)
    return jsonify({"success": "true", "msg": "message posted!"}), 200


@app.route("/get_user_messages_by_token/<token>", methods=["GET"])
def get_msg_token(token):

    print(token)

    if database_helper.get_token(token) == False:
        return jsonify({"success": "false", "msg": "token doesnt exist"}), 200

    email = database_helper.get_email(token)

    all_msg = database_helper.get_message(email)

    return jsonify({"success": "true", "msg": "data retrived!", "all_messages": all_msg}), 200


@app.route("/get_user_messages_by_email/<email>", methods=["GET"])
def get_msg_email(email):

    token = request.headers.get("Authorization")

    print(email)

    if database_helper.get_token(token) == False:
        return jsonify({"success": "false", "msg": "token doesnt exist"}), 200

    if database_helper.find_user(email) == False:
        return jsonify({"success": "false", "msg": "email doesnt exist"}), 200

    all_msg = database_helper.get_message(email)

    return jsonify({"success": "true", "msg": "data retrived!", "all_messages": all_msg}), 200


@app.route('/')
def root():
    app = Flask(__name__, static_url_path='/static')

    return app.send_static_file("client.html")


if __name__ == "__main__":
    app.debug = True
    app.run()
