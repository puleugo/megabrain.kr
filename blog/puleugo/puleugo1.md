---
authors: puleugo
date: Fri, 12 Sep 2025 00:05:25 +0900
---

# AI를 더 명확하게 사용할 수 있는 3-File System

# 3-File System

3-File System은 AI에게 업무 요청할 때, 실제로 주니어 개발자에게 일을 시키듯이 **요구사항, 체크리스트, 보고 방식**에 대해 지시하는 방식입니다.

## 1\. 제품 요구사항 명세서(PRD)

첫번째로 PRD는 Product Requirements Documents, **제품 요구사항 명세서**입니다.  
PRD 파일은 AI에게 여러가지 요청을 반복하다가 AI가 **추론을 반복하다 이상한 기획으로 가는 것을 사전에 막는 역할**을 합니다.  
저도 업무를 과도하게 분석하다가 본질을 놓치는 경우가 많으니까요.

요약:

*   markdown 포맷으로 PRD를 작성하라.
*   PRD는 명확하고 실행 가능하며 주니어 개발자가 이해하고 구현하기에 적합해야한다.
*   사용자는 새로운 기능, 기능에 대한 간단한 설명/요청을 제공한다.
*   PRD 작성 전 **상세한 질문**을 하여 구체화를 진행한다.
*   PRD 생성 밎 저장: 생성된 문서를 \`/task\` 디렉토리에 \`prd-\[feature-name\].md\` 방식으로 저장한다.

creat-prd.mdc:

```
# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt.
The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1. **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2. **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask clarifying questions to gather sufficient detail. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out).
3. **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4. **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions Format

When asking clarifying questions, the AI *must* format them as a numbered list. This list should support nested sub-questions using dot notation (e.g., 1, 2, 2.1, 2.2, 3).

Example format:
1. Top-level question 1?
2. Top-level question 2?
    2.1. Sub-question related to question 2?
    2.2. Another sub-question related to question 2?
3. Top-level question 3?

There should only be one atomic question per list item.

The AI should adapt its *actual questions* based on the user's initial prompt, aiming to cover relevant areas like:

- **Problem/Goal:** What problem does this feature solve? What is the primary goal?
- **Target User:** Who is this feature for?
- **Core Functionality:** What are the essential actions the user must be able to perform?
- **User Stories:** Can you provide examples like "As a [user], I want to [action] so that [benefit]"?
- **Acceptance Criteria:** How do we define success for this feature?
- **Scope/Boundaries:** What should this feature explicitly *not* do?
- **Data:** What information needs to be displayed or managed?
- **Design/UI:** Are there mockups or specific UI preferences?
- **Edge Cases:** What potential errors or unusual situations should be considered?

# PRD Structure

The generated PRD should include the following sections:

1. **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal.
2. **Goals:** List the specific, measurable objectives for this feature.
3. **User Stories:** Detail the user narratives describing feature usage and benefits.
4. **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5. **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.
6. **Design Considerations (Optional):** Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.
7. **Technical Considerations (Optional):** Mention any known technical constraints, dependencies, or suggestions (e.g., "Should integrate with the existing Auth module").
8. **Success Metrics:** How will the success of this feature be measured? (e-g., "Increase user engagement by 10%", "Reduce support tickets related to x*).
9. **Open Questions:** List any remaining questions or areas needing further clarification.

# Target Audience

Assume the primary reader of the PRD is a **junior developer**.
Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

- **Format:** Markdown (* md* )
- **Location:** */tasks/*
- **Filename:** prd-[meaningful-feature-name].md* (e.g., prd-user-profile-editing.md* )

## Final instructions

1. Do NOT start implmenting the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD
```

요청 예시:

```
@creat-prd.mdc 회원들의 모든 보트 이름과 얼마나 많은 이메일이 발송되었는지 보여주는 보고서를 추가하고 싶다.
```

설명: 요청사항을 제공하면 몇가지 질문 이후 제품 요구사항 명세서를 작성해줍니다. (e.g. `prd-member-email-interface.md`) 작성된 요구사항 명세서를 기반으로 업무를 새어

## 2\. 업무 생성 규칙 File

요약:

*   작성된 PRD를 기반으로 markdown 포맷으로 세부 단계별 작업 목록을 작성하라.
*   개발자가 구현을 위해 팔로우하기에 적합해야 한다.
*   다음과 같은 과정을 거친다.
    1.  사용자가 특정 PRD를 제공한다.
    2.  PRD를 분석하여 상위 업무를 생성한다.
    3.  생성한 상위업무를 사용자에게 컨펌받는다.
    4.  "Go"라는 응답이 오면 하위 작업을 생성한다.
    5.  작업 목록을 \`tasks/tasks-\[prd-file-name\].md\`에 저장하라.
*   "Go"라는 입력을 

generate-tasks.mdc:

```
# Rule: Generating a Task List from a PRD

## Goal

To guide an Al assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). The task list should be suitable for a developer to follow for implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[prd-file-name].md` (e.g., `tasks-prd-user-profile-editing.md`)

## Process

1. **Receive PRD Reference:** The user points the Al to a specific PRD file.
2. **Analyze PRD:** The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.
3. **Phase 1: Generate Parent Tasks:** Based on the PRD analysis, create the file and generate the main, high-level tasks required to implement the feature. Use your judgement on how many high-level tasks to use. It's likely to be 3-5. Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
4. **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
5. **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller. actionable sub-tasks. Ensure sub-tasks logically follow from the parent task and cover the implementation details implied by the PRD.
6. **Identify Relevant Files:** Based on the tasks and PRD. identify potential files that will need to be created or modified. List these under the `Relevant Files` section with a brief description of their purpose in relation to the tasks.
7. **Generate Final Output:** Combine the parent tasks, sub-tasks, and relevant files into the final Markdown structure.
8. **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[prd-file-name].md`, where [prd-file-name] matches the base name of the input PRD file (e.g., if the input was `prd-user-profile-editing.md`, the output is `tasks-prd-user-profile-editing.md`).

## Output Format

The generated task list _must_ follow this structure:
\`\`\`markdown

### Relevant Files

- `path/to/potential/file.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).

## Tasks

- [ ] 1.0 Parent Task Title
    - [ ] 1.1 Sub-task description
    - [ ] 1.2 Sub-task description
- [ ] 2.0 Parent Task Title
    - [ ] 2.1 Sub-task description
    - [ ] 2.2 Sub-task description
    - [ ] 2.3 Sub-task description
- [ ] 3.0 Parent Task Title (may not have sub-tasks if simple enough)
\`\`\`

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **developer** who will implement the feature.
```

## 3\. 업무 목록 관리 File

업무를 지시할 때 다음 지시사항을 따라 작업하세요.

요약:

*   한번에 하나의 작업만 수행하세요.
*   업무 완료 즉시 \[\]를 \[x\]로 변경하세요.
*   큰 작업을 시작하기 전에 하위 작업을 확인하세요.
*   하나의 작업을 수행한 후 사용자의 승인을 대기하세요.

task-list.mdc:

```
# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## Task Implementation

-   **One sub-task at a time:** Do **NOT** start the next subtask until you ask the user for permission and they say "yes" or "y"
-   **Completion protocol:**
    1.  When you fifish a **subtask**, immediately mark it as completed by changing '\[ \]' to '\[x\]\*.
    2.  If **all** subtasks underneath a parent task are now '\[x\]", also mark the **parent task** as completed.
-   Stop after each subtask and wait for the users goahead.

## Task List Maintenance

1.  **Update the task list as you work:**
    -   Mark tasks and subtasks as completed (`[x]`) per the protocol above.
    -   Add new tasks as they emerge.
2.  **Maintain the "Relevant Files" section:**
    -   List every file created or modified.
    -   Give each file a one-line description of its purpose.

## AI Instructions

When working with task lists, the AI must:

1.  Regularly update the task list file after finishing any significant work.
2.  Follow the completion protocol:
    -   Mark each finished **sub-task** `[x]`.
    -   Mark the **parent task** `[x]` once **all** its subtasks are `[x]`
3.  Add newly discovered tasks.
4.  Keep "Relevant Files" accurate and up to date.
5.  Before starting work, check which sub-task is next.
6.  After implementing a sub-task, update the file and then pause for user approval.
```

# 오리지널

*   [https://youtu.be/fD4ktSkNCw4?si=JqbJ1oyn1\_nG7WtD](https://youtu.be/fD4ktSkNCw4?si=JqbJ1oyn1_nG7WtD)

