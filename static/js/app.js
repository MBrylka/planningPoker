
var socket;

var app = new Vue({
    el: '#app',
    delimiters: ["[[","]]"],
    data: {
        lockOK: false,
        currentUser: {},
        message: 'Hello World',
        ready: false,
        cards: [],
        fibbo: [1,2,3,5,8,13,21,34,55,89,144,233]

    },

    methods: {
        init: function() {
            socket = io("http://localhost:5000")
            var person = prompt("Podaj nazwę");
            var user = {name: person, value: 0, visible: false, ready: false};
            this.currentUser = {socketId: socket.id, user: user};
        },

        addUser: function(user) {
            this.cards.push(user)
        },

        removeUser: function(userId) {
            var index = this.cards.findIndex(element => element.socketId == userId)
            this.cards.splice(index,1);
        },

        clickFibbo: function(number) {
            if(!this.currentUser.user.ready) {
                if(this.currentUser.user.value == number) {
                    this.currentUser.user.value = 0;
                    this.currentUser.user.visible = false;
                } else {
                    this.currentUser.user.visible = true;
                    this.currentUser.user.value = number;
                }
            }
        },

        clickOK: function() {
            var curUser = this.currentUser.user
            if(curUser.visible && !this.lockOK)
                if(curUser.ready == false) {
                    curUser.ready = true;
                    socket.emit('userReady', this.currentUser)
                    console.log("USER READY", this.currentUser)
                } else {
                    curUser.ready = false
                    socket.emit('userNotReady', this.currentUser)
                }
                    
        },

        markUserOK: function(user) {
            if(user.socketId != this.currentUser.socketId) {
                var index = this.cards.findIndex(element => element.socketId == user.socketId)
                this.cards[index].user.ready = user.user.ready
                this.cards[index].user.value = user.user.value
            }
        },

        allReady: function(data) {
            console.log(data)
            this.cards.forEach(card => {
                card.user.visible = true
            })
        }


    },
    mounted() {
        this.init()
    }
})

socket.on('connect', function() {
    app.currentUser.socketId = socket.id;
    socket.emit('join', app.currentUser);
});

socket.on("users", function(data) {
    this_ = this
    data.forEach(element => {
        var exists = false;
        if (element.socketId == app.currentUser.socketId) {
            exists = true;
        } else {
            app.cards.forEach(card => {
                if(element.socketId == card.socketId) {
                    exists = true;
                }
            });
        }
        if (!exists) {
            app.addUser(element)
        }
    });
});

socket.on("userDisconnected", function(data) {
    app.removeUser(data)
});


socket.on("userIsReady", function(data) {
    app.markUserOK(data)
});

socket.on("userIsNotReady", function(data) {
    app.markUserOK(data)
});

socket.on("allUsersReady", function(data) {
    console.log("all ready")
    app.allReady(data)
});