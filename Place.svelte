<script lang="javascript">
    import { createEventDispatcher } from 'svelte';
    import Unit from './Unit.svelte'
    import Gate from './Gate.svelte'
    import {onMount} from 'svelte'
    export let units = []
    export let choose
    export let place = {name:'',gate:0}

    onMount(x=>{})
    let dispatch = createEventDispatcher();
    let click = e => choose('choose-place',e.target.getAttribute('name'))
    import { quintOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    let renderGate = false
    place.renderGate = bl => renderGate = bl

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
    });
    let el
</script>
<style lang="stylus">
:global
    arcticocean = #c4b29B
    northpacific = #585c92
    northamerica = #bc6228
    northatlantic = #585c72
    scandinavia = #c75531
    europe = #774521
    northasia = #fc3218
    southamerica = #fc3218
    southasia = #be440f
    arabia = #ce943f
    westafrica = #cd836c
    indianocean = #a8ace2
    eastafrica = #9d533c
    antarctica = #ca935e
    southatlantic = #70966f
    southpacific = #685c92
    australia = #774521
    .arcticocean 
        grid-column 1 / 17
        // background arcticocean
    .northpacific
        grid-column 1 / 3
        grid-row 4 / 9
        // background northpacific
    .northamerica
        grid-column 3 / 6
        grid-row 4 / 8
        // background northamerica
    .northatlantic
        grid-column 6 / 9
        grid-row 6 / 10
        // background northatlantic
    .scandinavia
        grid-column 10 / 13
        grid-row 3 / 4
        // background scandinavia
    .europe
        grid-column 8 / 12
        grid-row 5 / 6
        // background europe
    .northasia
        grid-column 13 / 15
        grid-row 3 / span 2
        // background northasia
    .arabia
        grid-column 12 / 14
        grid-row 6 / span 4
        // background arabia
    .indianocean
        grid-column 13 / 17
        grid-row 11 / 15
        // background indianocean
    .southasia
        grid-column 14 / 17
        grid-row 5 / span 4
        // background southasia
    .southamerica
        grid-column 5 / 7
        grid-row 10 / span 3
        // background southamerica
    .westafrica
        grid-column 9 / 11
        grid-row 8 / span 3
        // background westafrica
    .southpacific
        grid-column 3 / 7
        grid-row 14 / span 2
        // background southpacific
    .southatlantic
        grid-column 7 / 11
        grid-row 12 / span 3
        // background southatlantic
    .eastafrica
        grid-column 11 / 13
        grid-row 10 / span 3
        // background eastafrica

    .australia
        grid-column 1 / 4
        grid-row 11 / span 3
        // background australia
    .antarctica
        grid-column 7 / 15
        grid-row 15 / 16
        // background antarctica
    .l
        display grid
        grid-template-columns: repeat(auto-fit, minmax(1em, 3em));
        align-content center
        box-sizing border-box
        padding 1em
        row-gap 0.5em
        justify-content center
        align-items center
</style>

<!-- prettier-ignore -->
<template lang="pug">
    .l(class='{place.name}' bind:this=el name='{place.name}' on:click='{click}' )
        +each (`units.filter(u=>u.place==place.name) as unit (unit.id)`)
            div(in:receive="{{key: unit.id}}" out:send="{{key: unit.id}}" animate:flip="{{duration: 200}}")
                Unit(unit='{unit}' '{choose}')
        +if('{renderGate}') 
            Gate('{place}')

</template>
