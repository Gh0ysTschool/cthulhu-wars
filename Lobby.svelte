<script lang="javascript">
    import Game from './Game.svelte'
import Gate from './Gate.svelte';
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
    let promise = firebase.database().ref("game").get()
    let newgame=()=>{page='Game'},join=(key)=>{page=key},off=()=>{page='Game'},back=()=>{},page='menu'
</script>

<style lang="stylus">
      
</style>
{#if (page=='menu') }
    <ul>
        {#await promise then value}
            {#each Object.keys(value.val()) as key}
            <li on:click={f=>join(key)}> {key}</li>
            {/each}
        {/await}
    </ul>
{:else}
    <Game {page}></Game>
{/if}
<!-- prettier-ignore -->
<template lang="pug">

</template>
