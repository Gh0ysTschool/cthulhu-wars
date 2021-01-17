<script lang="javascript">
    import { createEventDispatcher } from 'svelte';
    import Unit from './Unit.svelte'
    import Gate from './Gate.svelte'
    import {onMount} from 'svelte'
    export let units = []
    export let choose
    onMount(x=>{})
    let dispatch = createEventDispatcher();
    let click = e => choose('place',e.target.getAttribute('name'))
    let arcticocean, northpacific, northamerica, northatlantic, scandinavia, europe, northasia, southamerica, southasia, arabia, westafrica, indianocean, eastafrica, antarctica, southatlantic, southpacific, australia;
    export let places = {}
    import { quintOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    

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
</script>
<style lang="stylus">
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

    
        arcticocean = #00000000
        northpacific = #00000000
        northamerica = #00000000
        northatlantic = #00000000
        scandinavia = #00000000
        europe = #00000000
        northasia = #00000000
        southamerica = #00000000
        southasia = #00000000
        arabia = #00000000
        westafrica = #00000000
        indianocean = #00000000
        eastafrica = #00000000
        antarctica = #00000000
        southatlantic = #00000000
        southpacific = #00000000
        australia = #00000000
    .grid
        z-index 9
    .grid, .grid2
        top 0
        left 0
        right 15%
        bottom 0
        background-image url('./../earth35.png')
        display grid
        background-size 100% 100%
        grid-template-rows repeat(13, 6.66%)
        grid-template-columns repeat(15, 6.66%)
        position absolute
    .arcticocean 
        grid-column 1 / 17
        background arcticocean
    .northpacific
        grid-column 1 / 3
        grid-row 4 / 9
        background northpacific
    .northamerica
        grid-column 3 / 6
        grid-row 4 / 8
        background northamerica
    .northatlantic
        grid-column 6 / 9
        grid-row 6 / 10
        background northatlantic
    .scandinavia
        grid-column 10 / 13
        grid-row 3 / 4
        background scandinavia
    .europe
        grid-column 8 / 12
        grid-row 5 / 6
        background europe
    .northasia
        grid-column 13 / 15
        grid-row 3 / span 2
        background northasia
    .arabia
        grid-column 12 / 14
        grid-row 6 / span 4
        background arabia
    .indianocean
        grid-column 13 / 17
        grid-row 11 / 15
        background indianocean
    .southasia
        grid-column 14 / 17
        grid-row 5 / span 4
        background southasia
    .southamerica
        grid-column 5 / 7
        grid-row 10 / span 3
        background southamerica
    .westafrica
        grid-column 9 / 12
        grid-row 8 / span 3
        background westafrica
    .southpacific
        grid-column 3 / 7
        grid-row 14 / span 2
        background southpacific
    .southatlantic
        grid-column 7 / 11
        // grid-row 12 / span 3
        grid-row 11 / span 3
        background southatlantic
    .eastafrica
        grid-column 11 / 13
        grid-row 10 / span 4
        background eastafrica
    .australia
        grid-column 1 / 4
        grid-row 11 / span 3
        background australia
    .antarctica
        grid-column 7 / 15
        grid-row 15 / 16
        background antarctica
    .grid2
        position absolute
        z-index 10
        background-image none
        background #55555533
        @media only screen and (max-device-width 1000px)
            font-size 0.35em
    .l
        display grid
        grid-template-columns: repeat(auto-fit, minmax(0.5em, 2em));
        align-content center
        box-sizing border-box
        padding 1em
        row-gap 0.2em
        columns-gap 0.2em
        justify-content center
        align-items center
</style>

<!-- prettier-ignore -->
<template lang="pug">
    .grid2
        each loc in ['arcticocean','northpacific','northamerica','northatlantic','scandinavia','europe','northasia','southamerica','southasia','arabia','westafrica','indianocean','eastafrica','antarctica','southatlantic','southpacific','australia']
            .l(class=loc bind:this="{"+loc+"}" name=loc on:click='{click}' )
                +each (`units.filter(u=>u.place=='${loc}') as unit (unit.id)`)
                    div(in:receive="{{key: unit.id}}" out:send="{{key: unit.id}}" animate:flip="{{duration: 200}}")
                        Unit(unit='{unit}' '{choose}')
                Gate(places='{places}' name=loc '{choose}')
    .grid 
</template>
