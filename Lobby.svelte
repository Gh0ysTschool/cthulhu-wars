<script lang="javascript">
    import Game from './Game.svelte'
    let firebaseConfig = {
        apiKey: "AIzaSyAtutNxHpxtCJi3EUB3irfhNiTfoMu1zLY",
        authDomain: "cw-wars.firebaseapp.com",
        databaseURL: "https://cw-wars-default-rtdb.firebaseio.com",
        projectId: "cw-wars",
        storageBucket: "cw-wars.appspot.com",
        messagingSenderId: "311965598360",
        appId: "1:311965598360:web:b4f0ff76188930035e86ed"
    }
    firebase.initializeApp(firebaseConfig);
    let newgame=()=>{page='Game'},join=()=>{page='Game'},off=()=>{page='Game'},back=()=>{},page=''
</script>

<style lang="stylus">
      
</style>

<!-- prettier-ignore -->
<template lang="pug">
    +if('page=="Game"')
        Game
        +else
            button(on:click='{back}') back
            ul
                li(on:click='{newgame}') new game
                li(on:click='{join}') join game
                li(on:click='{off}') offline
</template>
