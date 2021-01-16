<script lang="javascript">
    export let choose,player,G
    import Unit from './Unit.svelte'
    import { createEventDispatcher } from 'svelte';
    let dispatch = createEventDispatcher();
    import {onMount} from 'svelte'
    let el
    onMount(x=>{
        el.style.color = player.faction.color//'linear-gradient(70deg,#363636,'+player.faction.color+')'
    })
    let click = e => {
        e.stopPropagation()
        choose('player',player)
    }
</script>
<style lang="stylus">
    .player
        padding 1em
        margin 1em
        border 0.4em solid black
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        position relative
        color #121212
    .player2
        background #343434
        height 3.4vh
        margin 0.5%
        padding 0.1em
        padding-left 0.8em
        padding-right 0.8em
        border 0.1em solid
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        position relative
        font-family 'Montserrat', arial
        transition height 0.5s
        text-align center
        .details
            height 1%
            overflow hidden
            transition height 0.5s
            padding: 0;
            li
                text-align center
                list-style-type none
                width 90%
                border-bottom 0.1em solid
                margin 0.2em
        &:hover, &:active
            height 90vh
            .details
                height 100%
                .active
                    border 0.2em solid
</style>

<!-- prettier-ignore -->
<!-- 
.player(bind:this='{el}' on:click='{click}') {player.faction.name}
ul
    li doom {player.doom}
    li power {player.power}
    li spellbooks -->
<template lang="pug">
    .player2(bind:this='{el}' on:click='{click}') {player.faction.name} | dm {player.doom} | pw {player.power} | sb {player.books.length}
        ul.details 
            +each ('player.faction.bookreqs as book')
                li {Object.keys(book)[0]}
            +each ('player.books as book')
                li.active {book}
            div(style='display:grid;grid-template-columns: auto auto auto auto')
                +each ("player.units.filter( u => u.place == '') as unit")
                    Unit('{unit}' choose='{choose}')
                +each ("G.units.filter( u => u.place == player.faction.name) as unit")
                    Unit('{unit}' choose='{choose}')
</template>
