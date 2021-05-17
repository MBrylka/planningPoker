from flask import Flask, render_template, request
from flask_socketio import SocketIO


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

users = []

@app.route('/')
def pplication():
    return render_template('static/index.html')

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
    print(users)

@socketio.on('userReady')
def handleUserReady(data):
    print

if __name__ == '__main__':
    socketio.run(app)