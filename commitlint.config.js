const COMMIT_TYPES = new Set([
  'feat',
  'fix',
  'style',
  'refactor',
  'hotfix',
  'revert',
  'chore',
  'ci',
  'docs',
  'test',
]);

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\((\w+)\))?:\s(.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    // Для корректной работы своего правила необходимо:
    // добавить правило, используемое в commitlint,
    // отключить его с помощью ':[0]'
    // добавить свое правило с припиской function-rules/
    'type-empty': [0],
    'subject-empty': [0],
    'scope-empty': [0],

    // проверка на пустой type
    'function-rules/type-empty': [
      2, // level: error
      'always',
      (parsed) => {
        if (!COMMIT_TYPES.has(parsed.type) || parsed.type === null) {
          return [
            false,
            `Error: Неверный тип коммита "${parsed.type}", разрешенные типы: ${[
              ...COMMIT_TYPES,
            ].join(', ')}`,
          ];
        }
        return [true];
      },
    ],

    // проверка на пустой subject
    'function-rules/subject-empty': [
      2, // level: error
      'always',
      (parsed) => {
        if (!parsed.subject) {
          return [false, 'Error: Нет описания коммита, формат type(optional scope): subject'];
        }
        return [true];
      },
    ],

    // проверка на пустой scope
    'function-rules/scope-empty': [
      1, // level: warning
      'always',
      (parsed) => {
        if (!parsed.scope) {
          return [false, 'Warning: не указан scope'];
        }
        return [true];
      },
    ],
  },
};
