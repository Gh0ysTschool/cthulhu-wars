<script lang="javascript">
    export let choose,player,G
    import Unit from './Unit.svelte'
    import Tooltip from './Tooltip.svelte'
    import Description from './Description.svelte'
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
    .player2
        background #343434
        border-radius 0
        height 5%
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
        max-width 18vw
        @media only screen and (max-device-width 1000px)
            font-size 0.5em
        .details
            height 1%
            overflow-y hidden
            transition height 0.5s
            padding: 0;
            @media only screen and (max-device-width 1000px)
                font-size 2em
            li
                text-align center
                list-style-type none
                width 90%
                border-bottom 0.1em solid
                margin 0.2em
        &:hover, &:active
            height 80%
            .details
                height 100%
                .active
                    border 0.2em solid
        .units
            display flex
            flex-wrap wrap
            @media only screen and (max-device-width 1000px)
                font-size 0.5em
        .book
            border-radius 0
            border 0.1em dotted
</style>

<!-- prettier-ignore -->
<template lang="pug">
    .player2(bind:this='{el}' on:click='{click}') {player.faction.name} | dm {player.doom} | pw {player.power} | sb {player.books.length}| es {player.signs.length}
        ul.details 
            +each ('player.faction.bookreqs as book')
                li {book}
            +each ('player.books as book')
                li.active {book}
            div.units
                +each ("player.units.filter( u => u.place == '') as unit")
                    Unit('{unit}' choose='{choose}')
                +each ("G.units.filter( u => u.place == player.faction.name) as unit")
                    Unit('{unit}' choose='{choose}')
            +each ("player.faction.books as book")
                Tooltip(key='{book}' left=true)
                    .book {book}
</template>
