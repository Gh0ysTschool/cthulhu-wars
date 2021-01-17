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
        "Immortal": "(Ongoing): Once Cthulhu has Awakened, he costs only 4 Power each subsequent time he is Awakened. Whenever you Awaken any Great Old One, gain 1 Elder Sign.",
        "Devour": "(Pre-Battle): The enemy player chooses and Eliminates one of his Monsters or Cultists in the Battle.",
        "Abduct":"(Pre-Battle): Eliminate one or more Nightgaunts from the Battle. For each one Eliminated, your enemy must Eliminate one of his own Monsters or Cultists from the Battle.",
        "Emissary of the Outer Gods":"(Post-Battle): Unless an enemy Great Old One is involved in the Battle, a Kill applied to Nyarlathotep becomes a Pain. If Nyarlathotep cannot be Pained due to being surrounded, he is not Eliminated.",
        "Invisibility":"(Pre-Battle): Select one Monster or Cultist (from either Faction) for each Flying Polyp present and 'exempt' it. The selected Unit does not participate in the rest of the Battle.",
        "Madness":"(Ongoing): After all Pain results have been assigned, you, rather than the Units' owners, choose the Area(s) to which all Pained Units will go. You may apply these results in any order (rather than the normal 'attacker first, then defender'), but you must still follow all other rules. Do this even for Battles in which you did not participate.",
        "Seek and Destroy":"(Pre-Battle): Immediately move any or all Hunting Horrors from any Area(s) into the Battle Area.",
        "The Thousand Forms":"(Action: Cost 0): If Nyarlathotep is in play, roll a die. Your foes lose that much Power between them; they have 1 minute to decide how much each loses. If they cannot agree, you receive Power equal to the number rolled. Flip this spellbook over; it cannot be used again in this Action Phase. During the Gather Power Phase, flip it face-up again.",
        "Flight": "(Ongoing): All of your Units can fly (even Cultists). When Moved, they can travel 2 Areas. They can fly over Areas containing enemy units.",
        "The Habinger": "(Post-Battle): If Nyarlathotep is in a Battle in which one or more enemy Great Old Ones are Pained or Killed, you receive Power equal to half of the cost of Awakening those Great Old Ones. For each enemy Great Old One Pained or Killed, you may choose to receive 2 Elder Signs instead of Power.",
        "He Who Must Not Be Named":"(Action: Cost 1): Move Hastur to any Area containing a Cultist of any Faction. You may then take a second, different Action. You may NOT take The Screaming Dead as your second Action.",
        "Passion":"(Ongoing): When one or more of your Cultists are Eliminated by an enemy (Killed, Captured, etc.), gain 1 Power.",
        "Shriek of the Byakhee":"(Action: Cost 1): Move any or all Byakhee from their current Area(s) to any one Area on the Map.",
        "The Screaming Dead":"(Action: Cost 1): Move the King in Yellow to an adjacent Area. Any Undead in the same Area can move with him for free. You may then take a second, different Action. You may NOT take He Who is Not to be Named as your second Action.",
        "The Third Eye":"(Ongoing): If Hastur is in play, the cost of Desecration is reduced by 1. If the Desecration succeeds, you also receive 1 Elder Sign.",
        "Zin Gaya":"(Action: Cost 1): Choose an Area containing any of your Undead and at least one enemy Acolyte Cultist. Your enemy Eliminates one of his Acolyte Cultists from that Area. Place an Undead from your Pool into that Area.",
        "Feast": "(Gather Power Phase): Gain +1 Power for each Area containing both a Desecration token and one or more of your Units.",
        "Desecrate": "(Action: Cost 2): If the King is in an Area with no Desecration token, roll 1 die. If the roll is equal to or less than the number of your Units in the Area (including the King), place a Desecration token in the Area. Whether you succeed or fail, place a Monster or Cultist with a cost of 2 or less in the Area.",
        "Vengence": "(Post-Battle): If Hastur is involved in a Battle, choose which Combat results are applied to which enemy Units (e.g., apply a Kill to a particular Great Old One).",
        "Blood Sacrifice": "(Doom Phase): If Shub-Niggurath is in play during the Doom Phase, you can choose to eliminate one of your Cultists. If you do, gain 1 Elder Sign.",
        "Frenzy": "(Ongoing): Your Cultists now have 1 Combat.",
        "Ghroth": "(Action: Cost 2): Roll a die. If the result is less than or equal to the number of Areas containing Fungi, your enemies must Eliminate a number of Cultists equal to the die roll. They have 1 minute in which to decide how to distribute these Eliminations. If time runs out, you choose for them. If the die roll is greater than the number of Areas with Fungi, place any Faction's Acolyte anywhere on the map.",
        "Necrophagy": "(Post-Battle): Move any or all Ghouls (who did not participate in the Battle) from any Area to the Battle Area, even if your Faction was not involved in the Battle. Each side involved in the Battle suffers an additional Pain result for each Ghoul moved in this way.",
        "The Red Sign": "(Ongoing): Dark Young can Create and Control Gates. Each adds 1 to Shub-Niggurath's Combat and each provides 1 Power during the Gather Power Phase. They do not act as Cultists with respect to any other purpose.",
        "The Thousand Young": "(Ongoing): If Shub-Niggurath is in play, Ghouls, Fungi, and Dark Young each cost 1 less Power to Summon.",
        "Avatar": "(Action: Cost 1): Choose an Area and a Faction. Swap the location of Shub-Niggurath with that of a Monster or Cultist in the chosen Area. The owner of the chosen Faction chooses which Unit to relocate.",
        "Fertility Cult": "(Ongoing): You may Summon Monsters as an Unlimited Action.",
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