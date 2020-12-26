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
        width 2em
        height 2em
        border 0.4em solid black
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        position relative
        background grey
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
</style>

<!-- prettier-ignore -->
<template lang="pug">
    +if('place.gate && place.nocults')
        .gate(bind:this='{el}' on:click='{click}')
</template>
