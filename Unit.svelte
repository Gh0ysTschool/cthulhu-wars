<script lang="javascript">
    export let choose
    import { createEventDispatcher } from 'svelte';
    let dispatch = createEventDispatcher();
    export let unit = {owner:{faction:{color:'black'}}}
    import {onMount} from 'svelte'
    let el
    onMount(x=>{
        el.style.background = unit.owner.faction.color + ` url(./${unit.type.toLowerCase().replaceAll("'",'').split(' ').join('')}.webp) center center`
        el.style.backgroundSize = '100% 100%'
    })
    let click = e => {
        e.stopPropagation()
        choose('unit',unit)
    }
</script>
<style lang="stylus">
    .unit
        width 2em
        height 2em
        border 0.4em solid black
        border-radius 50%
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        position relative
        display grid
        align-content center
        justify-content center
        color black
        font-family 'Montserrat',arial
    .gate
        &:before
            content:''
            z-index -1
            position absolute
            border-radius 50%
            top -0.8em
            bottom -0.8em
            left -0.8em
            right -0.8em
            box-shadow 1px 1px 4px 1px #000a
            background #ddd
    .mon
        width 3em
        height 3em
    .goo 
        width 4em 
        height 4em
</style>

<!-- prettier-ignore -->
<template lang="pug">
    .unit( bind:this='{el}' class:mon='{unit.tier==1}' class:goo='{unit.tier==2}' on:click='{click}' class:gate='{unit.gate}') {unit.type[0]}
</template>
