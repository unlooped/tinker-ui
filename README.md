**First things first:** this repository is still heavily under construction and
as such, nothing is set in stone, everything can be changed at any time.

# Tinker UI

Tinker UI is the frontend portion of Tinker. While Tinker was originally written
in Ruby, one idea I've always had, is that it would be awesome if the backend is
interchangeable. Separating the UI code is the first step in that direction.


## So... what does this thing do?

Ideally, a standard Tinker app would be built from two components, the UI and
your backend of choice. These two would be tied together to make the final
result. This is the goal.

However, to get there we'll take a few steps. First thing on the list is to
separate (almost) all the UI-related code (css, js, templates) into this
repository, which will then be included in the existing [tinker][tinker]. Tinker
UI will provide a specification of which calls in the backend it requires on,
and it's then up to your backend of choice to implement those calls.


## How do I use it?

Tinker UI isn't supposed to be used on it's own (for now), it depends on a
backend to provide rendering of a page that includes the scripts. So the steps
that are shown here are mainly for maintainers of the backend, they should try
and integrate this into the build/deploy mechanism of choice.

### How to integrate

Ideally, you'll have this project as a submodule of your backend (for now), in
the root of the project: `git submodule add
https://github.com/chielkunkels/tinker-ui ui`. In a ruby project, this would
leave me with a working tree that looks something like this:

```
.
|- config.json
|- config.ru
|- public/
|- ui/ <- this would be the submodule
`- views/
```

I'll assume this directory structure when running commands in the rest of this
readme.

### Dependancies

Tinker UI has a few dependancies. Some of these are node modules, others are simply
included in the project, through git submodules. You'll want to run `git
submodule update --init --recursive` to get all submodules and their respective
dependancies.

#### MooTools

Tinker UI is written on top of the MooTools javascript framework. You have two
options when it comes to obtaining it.

1. You can build it based on the included submodule (requires php) by running:
	`./ui/src/vendor/mootools-core/build > ./public/mootools.js`
2. You can simply download it from [the website][mootools]

#### Wrapup

The javascript code follows a CommonJS format, and is prepared for the browser
using [wrapup][wrapup], to install this, you need [node + npm][node]. Once you
have wrapup installed, you can compile it by using the `wrup` cli tool. In the
root of your project run:

```
$ wrup -r ./ui/src/js/init.js -o ./public/tinker.js
```

Basically you'll want to set `-o` to wherever your backend serves public assets
from (in case of most ruby projects, `/public/`). You can also use the `-w` flag
during development to make it watch for changes and auto-compile.

#### Stylus

To compile the stylus files to css, you currently have to be in the directory
where the files are located, otherwise import statements will break. I have an
outstanding [issue][stylus_issue] with the developers, so I hope this will get
fixed. That will make it easier to work it into a build script. For now, you can
`cd` into the directory and execute something like this:

```
$ stylus -c < tinker.styl > ../../../public/tinker.css
```

Again, this assumes the above directory structure.

#### Slab

Tinker UI uses [slab][slab] as the templating engine of choice, it allows you to
compile your templates down to javascript function, so you can use those in
production instead. I wrote a small utility script called [slab
loader][slab_loader] which allows slab to be used more easily during
development, by using synchronous XHRs and compiling on-the-fly.

When it comes to compiling for production, the easiest thing to do, is
concatenate all the slab files in `./src/tpl` into one string, and run that
through the slab cli compiler. That way we'll get a single object of template
functions, which can then be concatenated with the rest of the JS files, and
registered with `slab.register` (provided by slab-loader).

[tinker]: https://github.com/chielkunkels/tinker
[mootools]: http://mootools.net/
[wrapup]: https://github.com/kamicane/wrapup
[node]: http://nodejs.org/#download
[slab]: https://github.com/keeto/slab
[slab_loader]: https://github.com/chielkunkels/slab-loader
[stylus_issue]: https://github.com/LearnBoost/stylus/issues/757

