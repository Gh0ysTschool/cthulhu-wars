<script lang='javascript'>
  import {onMount} from 'svelte'
  export let tip = "",
    key,
    top = false,
    right = false,
    bottom = false,
    left = false,
    active = false,
    color = "#757575"
    let descriptions = {
        'Absorb': "(Pre-Battle): If a Shoggoth is present, Eliminate one or more of your Monsters or Cultists in the Battle. For each Unit so removed, add 3 dice to the Shoggoth's Combat for that Battle.",
        'Devolve': "(Ongoing): After any player's Action, you may replace any number of your Acolyte Cultists on the Map with the same number of Deep Ones from your Pool.",
        'Dreams': "(Action: Cost 2): Choose an Area containing an enemy's Acolyte Cultist. Your enemy must Eliminate one of his Acolyte Cultists from that Area and replace it with one from your Pool.",
        'Regenerate': "(Post-Battle): Assign up to 2 Kill or Pain Battle results to the same Starspawn. If 2 Kills are applied, the Starpspawn is Killed. On any other combination of Kill or Pain results, the Starspawn is only Pained.",
        'Submerge': "(Action: Cost 1): If Cthulhu is in an ocean or sea Area, remove him from the Map and place him on your Faction Card, along with any or all of your Units in the Area. Later, as a 0-cost Action, you may place Cthulhu, plus all accompanying Units, into any Area.",
        "Y'hn Nthlei": "(Ongoing): During the Gather Power Phase, if Cthulhu is in play, gain 1 Power for each enemy-controlled Gate in an ocean or sea Area.",
    }
  onMount(f=>{
    el = document.body.querySelector(".tooltip")
  })
  let el, style = `background-color: ${color};`,wrapper,hoverhandle = ()=>{el.classList.remove('hidden');el.style.left = wrapper.getBoundingClientRect().x - el.offsetWidth+'px';el.style.top = wrapper.getBoundingClientRect().y - el.offsetHeight+10+'px';el.innerText = descriptions[key] }, leavehandle = () => {el.classList.add('hidden')}
</script>

<style lang='stylus'>
  :global
    .hidden
      visibility : hidden
      display : none
  .tooltip-wrapper 
    position relative
  .tooltip 
    position: absolute;
    font-family: inherit;
    display: inline-block;
    width: 15vw
    right 15vw
    color: inherit;
    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms
  
  .default-tip 
    display: inline-block;
    padding: 8px 16px;
    border-radius: 6px;
    color: inherit;
  
  .tooltip.top 
    left: 50%;
    transform: translate(-50%, -100%);
    margin-top: -8px;
  
  .tooltip.bottom 
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 100%);
    margin-bottom: -8px;
  
  .tooltip.left 
    left: 0;
    transform: translateX(-100%);
    margin-left: -8px;
  
  .tooltip.right 
    right: 0;
    transform: translateX(100%);
    margin-right: -8px;
  
  .tooltip.active 
    opacity: 1;
    visibility: initial;
  .tooltip-slot:hover + .tooltip 
    opacity: 1;
    visibility: initial;
  
</style>

<template lang='pug'>
.tooltip-wrapper(bind:this='{wrapper}' on:mouseover='{hoverhandle}' on:mouseleave='{leavehandle}')
  span.tooltip-slot
    slot
  .tooltip(class:active class:left class:right class:bottom class:top)
    +if('tip')
      .default-tip({style}) {tip}
      +else
        slot(name="custom-tip")
</template>