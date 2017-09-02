// Vue.axios.get('http://localhost:3000/allusers')
//     .then(response => {
//         console.log(response);
//         this.users = response.data;

//     })
//     .catch(function(error) {
//         console.log(error);
//     });


new Vue({
    el: '#vue-app',
    data: {
        searchString: "",


        users: [{
                name: "Bob"
            }, {
                name: "Joe"
            }, {
                name: "Cidny"
            }

        ]
    },
    mounted: function() {
        Vue.axios.get('http://localhost:3000/allusers')
            .then(response => {
                console.log(response.data)

                this.users = response.data.data;
                console.log(Array.isArray(this.users));
            })
            .catch(function(error) {

            });
    },
    computed: {

        filterUsers: function() {

            var users_array = this.users;
            console.log(users_array)
            searchString = this.searchString;

            if (!searchString) {
                return users_array;
            }

            searchString = searchString.trim().toLowerCase();

            users_array = users_array.filter(function(item) {
                if (item.firstName.toLowerCase().indexOf(searchString) !== -1) {
                    return item;
                }
            })

            return users_array;
        }
    }
});