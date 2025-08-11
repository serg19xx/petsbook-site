export const PET_SPECIES = {
  // Popular species first
  POPULAR: [
    { value: 'Cat', label: 'UI.const.petspecies.options.cat' },
    { value: 'Dog', label: 'UI.const.petspecies.options.dog' },
    { value: 'Fish', label: 'UI.const.petspecies.options.fish' },
    { value: 'Other', label: 'UI.const.petspecies.options.other' },
  ],

  // All species alphabetically
  ALL: [
    { value: 'Axolotl', label: 'UI.const.petspecies.options.axolotl' },
    { value: 'Beetle', label: 'UI.const.petspecies.options.beetle' },
    { value: 'Betta Fish', label: 'UI.const.petspecies.options.betta_fish' },
    { value: 'Bird', label: 'UI.const.petspecies.options.bird' },
    { value: 'Budgie', label: 'UI.const.petspecies.options.budgie' },
    { value: 'Canary', label: 'UI.const.petspecies.options.canary' },
    { value: 'Cat', label: 'UI.const.petspecies.options.cat' },
    { value: 'Chinchilla', label: 'UI.const.petspecies.options.chinchilla' },
    { value: 'Cockatiel', label: 'UI.const.petspecies.options.cockatiel' },
    { value: 'Dog', label: 'UI.const.petspecies.options.dog' },
    { value: 'Ferret', label: 'UI.const.petspecies.options.ferret' },
    { value: 'Fish', label: 'UI.const.petspecies.options.fish' },
    { value: 'Frog', label: 'UI.const.petspecies.options.frog' },
    { value: 'Gerbil', label: 'UI.const.petspecies.options.gerbil' },
    { value: 'Goldfish', label: 'UI.const.petspecies.options.goldfish' },
    { value: 'Guinea Pig', label: 'UI.const.petspecies.options.guinea_pig' },
    { value: 'Hamster', label: 'UI.const.petspecies.options.hamster' },
    { value: 'Hedgehog', label: 'UI.const.petspecies.options.hedgehog' },
    { value: 'Lizard', label: 'UI.const.petspecies.options.lizard' },
    { value: 'Mouse', label: 'UI.const.petspecies.options.mouse' },
    { value: 'Other', label: 'UI.const.petspecies.options.other' },
    { value: 'Parrot', label: 'UI.const.petspecies.options.parrot' },
    { value: 'Praying Mantis', label: 'UI.const.petspecies.options.praying_mantis' },
    { value: 'Rabbit', label: 'UI.const.petspecies.options.rabbit' },
    { value: 'Rat', label: 'UI.const.petspecies.options.rat' },
    { value: 'Salamander', label: 'UI.const.petspecies.options.salamander' },
    { value: 'Snake', label: 'UI.const.petspecies.options.snake' },
    { value: 'Sugar Glider', label: 'UI.const.petspecies.options.sugar_glider' },
    { value: 'Tarantula', label: 'UI.const.petspecies.options.tarantula' },
    { value: 'Toad', label: 'UI.const.petspecies.options.toad' },
    { value: 'Turtle', label: 'UI.const.petspecies.options.turtle' },
  ],

  // Get all species with popular ones first
  getWithPopularFirst() {
    return [
      ...this.POPULAR,
      { value: '', label: '──────────', disabled: true }, // Separator
      ...this.ALL.filter(
        (species) => !this.POPULAR.some((popular) => popular.value === species.value),
      ),
    ]
  },
}
