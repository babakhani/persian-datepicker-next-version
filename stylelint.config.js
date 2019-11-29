module.exports =  {
  "rules": {
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "color-named": "never",
    "color-no-hex": true,
    "font-family-no-duplicate-names": true,
    "selector-pseudo-element-no-unknown": true,
    "selector-type-no-unknown": true,
    "media-feature-name-no-unknown": true,
    "comment-no-empty": true,
    "no-duplicate-selectors": true,
    "value-no-vendor-prefix": true,
    "no-duplicate-at-import-rules": true,
    "time-min-milliseconds": 100,
    "no-extra-semicolons": true,
    "selector-max-empty-lines": 0,
    "selector-max-attribute": 3,
    "selector-max-universal": 1,
    "selector-no-vendor-prefix": null,
    "selector-max-id": 0,
    "selector-no-qualifying-type": null,
    "property-no-unknown": true,
    "declaration-block-no-duplicate-properties": true,
    "declaration-block-no-shorthand-property-overrides": true,
    "comment-empty-line-before": [
      "always",
      {
        "ignore": [
          "stylelint-commands",
          "after-comment"
        ]
      }
    ],
    "declaration-colon-space-after": "always",
    "selector-list-comma-newline-after": "always",
    "indentation": 2,
    "max-empty-lines": 2,
    "unit-no-unknown": true,
    "selector-type-case": "lower",
    "selector-list-comma-space-before": "always-single-line",
    "unit-whitelist": [
      "em",
      "rem",
      "%",
      "px",
      "ms",
      "deg"
    ]
  }
}
