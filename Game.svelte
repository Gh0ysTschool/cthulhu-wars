<script lang="javascript">
    import Map from './Map.svelte'
    import Actions from './Actions.svelte'
    import Player from './Player.svelte'
    import places from './places.js'
    import factions from './factions.js'
    import phases from './phases.js'
    import Unit from './Unit.svelte'
import faction from './bg'
    
    let forceRerender = f => {
        // console.log(G)
        G = G
    }
    let players, turn, phase, stage, choices, units, player
    let unit = ( type = '', owner = {}, place = '', cost = 0, fight = 0, tier = 0, gather = 0) => ({ id:genid(), type, owner, place, cost, fight, gather, tier, gate:0 })
    let G = {unit, choices, players, player, places, phases, turn, phase, stage, units, forceRerender}
    G.choices = {
        book : {
            book : null,
        },
        awaken : {
            unit : null,
            place : null,
        },
        move : {
            unit : null,
            place : null,
        },
        fight : {
            place : null,
            enemy : null,
        },
        hire : {
            place : null,
        },
        open : {
            place : null,
        },
        summon : {
            unit : null,
            place : null,
        },
        steal : {
            place : null,
            unit : null,
        },
    }
    
    phases.init(G)
    factions(G,phases)
    let playerinit = ( faction='', units = [], doom=0, power=0 ) => ({ units,faction,doom,power,books:[],temp:{} })
    let fmove = ({unit, place}) => { unit.place = place; unit.gate=0;}
    let genid = f => nonce++
    let nonce = 0
    G.players = Object.values(G.factions).map( f => playerinit(f))
    G.players.map( p => {
        p.units = Array(6).fill(null).map( u => unit('cult',p,p.faction.start) )
        p.units[2].gate=p.faction.start
        places[p.faction.start].gate=1
        p.power = 8
        p.faction.initUnits(p)
    })
    G.turn = {lim:1,pi:G.players.indexOf(G.players.find( p => p.faction.name == 'gc'))||0}
    $: G.player = G.players[G.turn.pi%G.players.length]
    $: G.units = G.players.reduce((acc,cur)=>[...acc,...cur.units],[])
    G.phase = 'action'
    let actions = []
    G.stage = 'start'
    G.ritualtracks = {
        3:[5,6,7,8,9,10],
        4:[5,6,7,7,8,8,9,10],
        5:[5,6,6,7,7,8,8,9,9,10],
    }
    G.rituals = 0
    $: G.ritualcost = G.ritualtracks[G.players.length][G.rituals]
    let choose = x => {}
    $: actions = (G.stage == '') ? G.phases[G.phase]?.options()||[] : G.phases[G.phase].stages[G.stage]?.options()||[]
    let noop = (np,c) => {}
    $: G.choose = ((G.stage == '') ? G.phases[G.phase]?.moves?.choose||noop : G.phases[G.phase].stages[G.stage]?.moves?.choose)||noop
    let click = action => f => G.choose(G.stage,action)
</script>
<style lang="stylus">
    .hud
        position absolute
        top 0
        right 0
        left 0
        z-index 10
        display flex
        flex-direction row
        ul
            list-style-type none
            li
                width 90%
                border-bottom 0.1em solid
                margin 0.2em
                font-size 2em
                
    .actions
        height 4vh
        font-family 'Montserrat',arial
        margin 0.5%
        padding 0.1em
        text-align center
        padding-left 2em
        padding-right 2em
        border 0.1em solid black
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        overflow hidden
        top 0
        width fit-content
        right 1%
        color #ababab
        background #323232
        transition height 0.5s
        overflow-y scroll
        &:hover, &:active
            height: 90vh

        
</style>

<!-- prettier-ignore -->
<template lang="pug">
    Map('{...G}')
    .hud
        +each('G.players as player (player.faction.name)')
            Player(choose='{G.choose}' '{player}' '{G}')
        .actions(style='color: {G.player.faction.color}') actions
            ul(style='padding:0')
                +each('actions as action')
                    +if('G.stage.includes("unit")')
                        li(on:click='{click(action)}' style='color:{action.owner.faction.color}') {action.type} in {action.place||"pool"}
                        +elseif('G.stage.includes("player") || G.stage.includes("enemy") || G.stage.includes("faction")')
                            li(on:click='{click(action)}' style='color:{action.faction.color}') {action.faction.name}
                            +else
                                li(on:click='{click(action)}') {action}
                +if('G.phases[G.phase].stages && G.phases[G.phase].stages[G.stage].moves.done')
                    li(on:click='{G.phases[G.phase].stages[G.stage].moves.done}') done
                    +elseif('G.phases[G.phase].moves && G.phases[G.phase].moves.done')
                        li(on:click='{G.phases[G.phase].moves.done}') done
    </template>
