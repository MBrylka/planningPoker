from flask import Flask, render_template, request
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=2, ping_timeout=4)

users = []

@app.route('/')
def pplication():
    return render_template('index2.html')

@socketio.on('disconnect')
def handleDisconnect():
    print("userDisconnected", request.sid)
    socketio.emit('userDisconnected', request.sid, broadcast=True)
    for user in users:
        if user['socketId'] == request.sid:
            users.remove(user)
    
@socketio.on('join')
def handleJoin(data):
    users.append(data)
    socketio.emit("users", users, broadcast=True)
   
    print("connected: ", data)

@socketio.on('userReady')
def handleUserReady(data):
    socketio.emit("userIsReady", data, broadcast=True)
    for user in users:
        if(user['socketId'] == data['socketId']):
            user['user']['ready'] = True
            user['user']['value'] = data['user']['value']
    if checkAllReady():
        socketio.emit("allUsersReady", users, broadcast=True)
        print(users)


@socketio.on('userNotReady')
def handleUserNotReady(data):
    socketio.emit("userIsNotReady", data, broadcast=True)
    for user in users:
        if(user['socketId'] == data['socketId']):
            user['user']['ready'] = False

def checkAllReady():
    ready = True
    for user in users:
        if not user['user']['ready']:
            ready = False
    return ready

    
    if not unready:
        print("ALL READY")
        socketio.emit('allReady', broadcast=True)


if __name__ == '__main__':
    socketio.run(app)

