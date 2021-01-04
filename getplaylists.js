//the getplaylists function will produce an array of (playlist_id, user_id) given a user_id
const axios = require ('axios')

//var user_id = fion_the_lion;

//var token = BQBL6EoXd_N9SVmptkFbQ0-g4nd4o_3Nr-J1vhNEyQDm_i0ii3kpaAuj0JwYWm-5v28FlPZrHEH7hMhu7sUxNOIErOj0nRyPEU4yiHJVAhnGY_jEkhfiAM5YBPo-uEX7QhM2jz-pA08FbO8poa_3wxPV4AoIj_PsdQG8;


async function getplaylist(user_id, access_token) {
    try {
        const response = await axios({
            method: "get" ,
            url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        let info = response.data.items
        let playlists = []
        for (let i = 0; i < info.length;i++) {
            let playlist = {
                playlist_id: info[i].id,
                user_id: user_id
            }
            playlists.push(playlist)
        }
        console.log(playlists)
        
    } catch (err) {
        console.log(err.response)
    }
};

getplaylist("fion_the_lion","BQCQm0Bweo0TC7oIGDSXuHSprNt904Hb9jteMIQqfSt04VLuZmfbe8GBwKSonAWc_dszZMKBCY5sqjeXz4OjW_czQXZZmkqnXb4F3wJgXYEp71bDTQO-6Kf67tZ9rRHZwjXW80Wyk4v660pjZH-yklwx3MkeCN6MAiY8w1M")

module.exports = {
    getplaylist
}
// const APIController = (function() {

//     const getplaylist = async (user_id, token) => {
//         const result = await fetch (`https://api.spotify.com/v1/users/${user_id}/playlists"`, {
//             method: `GET`,
//             headers: { `Authorization` : `Bearer` + token}
//         });

//         const data = await result.json();
//         return data.playlists.items;
//     }

// })();




