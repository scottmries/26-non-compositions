<template>
  <section class="bg-black w-screen h-screen text-white">
    <div class="credits container flex flex-col justify-center">
      <h1 class="mb-8">26 Non-Compositions</h1>
      <div class="w-full md:flex mb-8">
        <div class="w-2/3 md:w-1/3 mb-4 md:mb-6 text-left md:text-center">
          <h3 class="mb-2 text-2xl">Object Composition:</h3>
          <p class="text-xl">
            Combining simple objects to create more complex ones.
          </p>
        </div>
        <div
          class="ml-auto md:ml-0 w-2/3 md:w-1/3 mb-6 md:mb-4 text-right md:text-center"
        >
          <h3 class="mb-2 text-2xl">Compositionality:</h3>
          <p class="text-xl">
            the principle that the meaning of a whole derives directly from the
            meaning of its parts and the ways in which they are combined.
          </p>
        </div>
        <div class="w-2/3 md:w-1/3 mb-6 md:mb-4 text-left md:text-center">
          <p class="mb-2 text-xl">
            “I wanted to end composing, get rid of it. I wanted it to die out.”
          </p>
          <h3 class="text-2xl">Tony Conrad</h3>
        </div>
      </div>
      <div>
        <nuxt-link class="text-white" to="about">About</nuxt-link>
      </div>
    </div>
  </section>
</template>
