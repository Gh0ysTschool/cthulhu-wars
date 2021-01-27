<script lang="javascript">
    import Game from './Game.svelte'
    import Gate from './Gate.svelte'
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
    let size
    let promise = firebase.database().ref("game").get()
    promise.then( v => size = v.val().length)
    let newgame=()=>{page='newgame'},join=(key)=>{page=key},off=()=>{page='Game'},back=()=>{},page='menu'
    let client = new URLSearchParams(window.location.search).get('faction')||'hotseat'
</script>

<style lang="stylus">
      
</style>
{#if (page=='menu') }
    {#if (client == 'hotseat')}
        <p> you're currently playing a hotseat pass-and-play game. select your faction to enable online play: </p>
        <a href='./?faction=ys'>yellow sign</a>
        <a href='./?faction=gc'>great cthulhu</a>
        <a href='./?faction=bg'>black goat</a>
        <a href='./?faction=cc'>crawling chaos</a>
    {/if}
    <span>games:</span>
    <ul>
        <li on:click={newgame}>new game</li>
        {#await promise then value}
            {#each Object.keys(value.val()) as key}
            <li on:click={f=>join(key)}> {key}</li>
            {/each}
        {/await}
    </ul>
{:else}
    <Game {page} {size}></Game>
{/if}
<!-- prettier-ignore -->
<template lang="pug">

</template>
