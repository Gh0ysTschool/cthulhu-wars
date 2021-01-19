<script lang="javascript">
    export let choose
    import { createEventDispatcher } from 'svelte';
    let dispatch = createEventDispatcher();
    export let unit = {owner:{faction:{color:'black'}}}
    import {onMount} from 'svelte'
    let el
    onMount(x=>{
        let imgurl = ((unit.type=='cult') ? unit.owner : '') + unit.type.toLowerCase().replaceAll("'",'').split(' ').join('')
        el.style.background = {'bg':'red','gc':'green','ys':'yellow','cc':'blue'}[unit.owner] + ` url(./${imgurl}.webp) center center`
        el.style.backgroundSize = '100% 100%'
    })
    let click = e => {
        e.stopPropagation()
        choose('unit',unit)
    }
</script>
<style lang="stylus">
    .unit
        font-size 0.6em
        width 2em
        height 2em
        border 0.2em solid black
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
            top -0.6em
            bottom -0.6em
            left -0.6em
            right -0.6em
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
    .unit( bind:this='{el}' class:mon='{unit.tier==1}' class:goo='{unit.tier==2}' on:click='{click}' class:gate='{unit.gate}')
</template>
