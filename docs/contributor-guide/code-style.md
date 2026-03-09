## C++ 代码格式规范

本节概述了 Buddy Compiler 项目的 C++ 代码风格指南，遵循 LLVM C++ 代码风格约定。遵守此风格对于保持代码库的一致性、可读性和可维护性非常重要。

**格式化工具**

我们使用 `clang-format` 根据 LLVM 风格指南自动格式化所有 C++ 代码。它确保所有代码格式一致，减少手动格式化的需要，并最大限度地减少与格式相关的审查意见。

格式化单个文件，运行以下命令：

```
$ clang-format -i <filename>
```

**代码格式化规则**

以下代码规范是我们特别强调的要点。

- 缩进

    - 使用 2 个空格进行缩进（不使用 Tab）。
    - 不要混合使用 Tab 和空格。

示例：

```
if (condition) {
  // 使用 2 个空格缩进
  doSomething();
}
```

- 花括号

    - 始终在代码块周围使用花括号 `{}`，即使只有单条语句。
    - 将左花括号放在控制语句（如 `if`、`for`）的同一行。

示例：

```
if (condition) {
  doSomething();
}

for (int i = 0; i < 10; ++i) {
  doSomethingElse();
}
```

- 行长度

    - 将行限制在 80 个字符以内（理想情况下）。如果一行超过限制，按照代码风格约定将其拆分为多行。
    - 如果某些代码需要更长的行或自定义样式，可以使用 `// clang-format off` 和 `// clang-format on` 包裹该部分，将其排除在自动格式化之外。

示例：

```
// clang-format off
patterns.add<
    BudTestConstantLowering,
    BudTestPrintLowering,
    BudTestEnumAttrLowering,
    BudTestArrayAttrLowering>(patterns.getContext());
// clang-format on
```

- 命名规范

    - 变量：使用小驼峰命名法（lowerCamelCase），即首字母小写，后续每个单词首字母大写（如 myVariable、userInput）。
    - 函数：函数名使用小驼峰命名法（如 calculateSum、fetchData）。
    - 类/结构体：使用大驼峰命名法（UpperCamelCase）（如 MyClass、UserInfo）。
    - 常量：使用全大写加下划线分隔（UPPER_CASE_WITH_UNDERSCORES）（如 MAX_VALUE、PI）。

示例：

```
int myVariable = 42;
void calculateSum() { ... }
class MyClass { ... };
const int MAX_VALUE = 100;
```

## Python 代码格式规范

Buddy Compiler 遵循 PEP 8 风格指南，同时沿用 LLVM 的格式化方法。
有关代码风格和格式化的详细信息，请参阅 [PEP8](https://peps.python.org/pep-0008/) 和 [LLVM 文档](https://llvm.org/docs/CodingStandards.html#python-version-and-source-code-formatting)。
以下是一些要点：

- 格式化：使用 `black` 和 `darker` 来格式化代码。

```
$ pip install black=='23.*' darker # 安装 black 23.x 和 darker
$ darker test.py                   # 格式化未提交的更改
$ darker -r HEAD^ test.py          # 同时格式化上次提交的更改
$ black test.py                    # 格式化整个文件
```

- 缩进：每级缩进使用 4 个空格，不使用 Tab。

- 最大行长度：代码行限制为最多 79 个字符，注释和文档字符串限制为 72 个字符。

- 导入：导入通常应独占一行，并按以下顺序分组：

    - 标准库导入。
    - 相关第三方库导入。
    - 本地应用/库特定导入。
    - 每组导入之间留一个空行。

- 空格：在二元运算符周围使用空格，例如：a = b + c。避免多余的空格。

- 注释：为所有公共函数和类添加 Google 风格的文档字符串。

- 命名规范：

    - 类名使用 `CamelCase`。
    - 函数、方法和变量名使用 `snake_case`。
    - 常量使用 `UPPERCASE_WITH_UNDERSCORES`。

- 表达式和语句中的空格：在以下情况下避免多余的空格：

    - 紧接在圆括号、方括号或花括号内部。
    - 紧接在逗号、分号或冒号之前。
    - 紧接在函数调用的参数列表左括号之前。
    - 紧接在索引或切片的左括号之前。

- 模块名称：

    - 模块应使用简短的全小写名称。
    - 如果能提高可读性，可以在模块名中使用下划线。
    - Python 包（目录）也应使用简短的全小写名称，但最好不要使用下划线。

    例如：

    `my_module.py` 优于 `MyModule.py` 或 `mymodule.py`。
    对于包（目录），`mypackage` 优于 `my_package`。

- 其他：
    - 使用两个空行分隔顶层函数和类定义。
    - 使用一个空行分隔类内部的方法定义。
