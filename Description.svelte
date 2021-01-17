<script lang="javascript">
    export let tag = ''
    let descriptions = {
        'Absorb': "(Pre-Battle): If a Shoggoth is present, Eliminate one or more of your Monsters or Cultists in the Battle. For each Unit so removed, add 3 dice to the Shoggoth's Combat for that Battle.",
        'Devolve': "(Ongoing): After any player's Action, you may replace any number of your Acolyte Cultists on the Map with the same number of Deep Ones from your Pool.",
        'Dreams': "(Action: Cost 2): Choose an Area containing an enemy's Acolyte Cultist. Your enemy must Eliminate one of his Acolyte Cultists from that Area and replace it with one from your Pool.",
        'Regenerate': "(Post-Battle): Assign up to 2 Kill or Pain Battle results to the same Starspawn. If 2 Kills are applied, the Starpspawn is Killed. On any other combination of Kill or Pain results, the Starspawn is only Pained.",
        'Submerge': "(Action: Cost 1): If Cthulhu is in an ocean or sea Area, remove him from the Map and place him on your Faction Card, along with any or all of your Units in the Area. Later, as a 0-cost Action, you may place Cthulhu, plus all accompanying Units, into any Area.",
        "Y'ha Nthlei": "(Ongoing): During the Gather Power Phase, if Cthulhu is in play, gain 1 Power for each enemy-controlled Gate in an ocean or sea Area.",
    }
</script>

<style lang="stylus">
    
</style>

<!-- prettier-ignore -->
<template lang="pug">
    div(style='background:black;') {descriptions[tag]||""}
</template>