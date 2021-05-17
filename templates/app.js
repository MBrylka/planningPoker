
var socket;

var app = new Vue({
    el: '#app',
    data: {
        currentUser: {},
        message: 'Hello World',
        ready: false,
        cards: [],
        fibbo: [1,2,3,5,8,13,21,34,55,89,144]

    },

    methods: {
        init: function() {
            socket = io("http://localhost:5000")
            var person = prompt("Podaj nazwę");
            var user = {name: person, value: 0, visible: false};
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
            if(!this.ready) {
                this.currentUser.user.visible = true;
                this.currentUser.user.value = number;
            }
        },

        clickOK: function() {
            this.ready = true;
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
    console.log(data)
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
