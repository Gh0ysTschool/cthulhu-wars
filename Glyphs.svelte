<script lang="javascript">
    export let choose
    import { createEventDispatcher } from 'svelte';
    let dispatch = createEventDispatcher();
    let place = {name:'place',gate:0,nocults:0}
    export let name = 'place'
    export let places = {place}
    import {afterUpdate} from 'svelte'
    $: place = places[name]
    let el
    let click = e => {
        e.stopPropagation()
        choose('gate',place)
    }
</script>
<style lang="stylus">
    .gate
        width 1em
        height 1em
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        position relative
        background yellow
        color black
        text-align center
        &:before
            content:''
            z-index -1
            position absolute
            border-radius 50%
            top -0.2em
            bottom -0.2em
            left -0.2em
            right -0.2em
            box-shadow 1px 1px 4px 1px #000a
            background yellow
</style>

<!-- prettier-ignore -->
<template lang="pug">
    +if('place.glyphs.includes("desecration")')
        .gate(bind:this='{el}') Φ
</template>
