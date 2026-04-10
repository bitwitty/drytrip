import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2 className="mt-10 font-serif text-2xl text-forest" {...props} />
  ),
  h3: (props) => (
    <h3
      className="mt-8 font-serif text-lg font-semibold text-forest"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="mt-4 text-sm leading-relaxed text-forest/70 sm:text-base"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-4 ml-4 list-disc space-y-2 text-sm leading-relaxed text-forest/70"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-4 ml-4 list-decimal space-y-2 text-sm leading-relaxed text-forest/70"
      {...props}
    />
  ),
  li: (props) => <li {...props} />,
  a: (props) => (
    <a
      className="font-medium text-forest underline underline-offset-2 transition-colors hover:text-forest/70"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 border-sandstone pl-4 italic text-forest/60"
      {...props}
    />
  ),
  strong: (props) => <strong className="text-forest" {...props} />,
  hr: () => <hr className="my-8 border-sandstone/30" />,
};
