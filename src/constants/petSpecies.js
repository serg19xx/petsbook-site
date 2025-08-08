export const PET_SPECIES = {
  // Popular species first
  POPULAR: [
    { value: 'Cat', label: 'Cat' },
    { value: 'Dog', label: 'Dog' },
    { value: 'Fish', label: 'Fish' },
  ],

  // All species alphabetically
  ALL: [
    { value: 'Axolotl', label: 'Axolotl' },
    { value: 'Beetle', label: 'Beetle' },
    { value: 'Betta Fish', label: 'Betta Fish' },
    { value: 'Bird', label: 'Bird' },
    { value: 'Budgie', label: 'Budgie' },
    { value: 'Canary', label: 'Canary' },
    { value: 'Cat', label: 'Cat' },
    { value: 'Chinchilla', label: 'Chinchilla' },
    { value: 'Cockatiel', label: 'Cockatiel' },
    { value: 'Dog', label: 'Dog' },
    { value: 'Ferret', label: 'Ferret' },
    { value: 'Fish', label: 'Fish' },
    { value: 'Frog', label: 'Frog' },
    { value: 'Gerbil', label: 'Gerbil' },
    { value: 'Goldfish', label: 'Goldfish' },
    { value: 'Guinea Pig', label: 'Guinea Pig' },
    { value: 'Hamster', label: 'Hamster' },
    { value: 'Hedgehog', label: 'Hedgehog' },
    { value: 'Lizard', label: 'Lizard' },
    { value: 'Mouse', label: 'Mouse' },
    { value: 'Other', label: 'Other' },
    { value: 'Parrot', label: 'Parrot' },
    { value: 'Praying Mantis', label: 'Praying Mantis' },
    { value: 'Rabbit', label: 'Rabbit' },
    { value: 'Rat', label: 'Rat' },
    { value: 'Salamander', label: 'Salamander' },
    { value: 'Snake', label: 'Snake' },
    { value: 'Sugar Glider', label: 'Sugar Glider' },
    { value: 'Tarantula', label: 'Tarantula' },
    { value: 'Toad', label: 'Toad' },
    { value: 'Turtle', label: 'Turtle' },
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
