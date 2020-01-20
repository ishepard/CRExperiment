import mistune


class Parser:
    # This function reads files' content written in Markdown Language and parse
    # it in html. has_code il a flag parameter that indicates the presence of
    # snippets to put in the page. Few tags have been defined in order to
    # let test
    # developers to easily add questions and text areas. #Q# represent a
    # question, #T# a test area, #cb# a checkbox option, #rb# a radio
    # button. If
    # after second '#' a '!' appears, the question is mandatory.
    def parse_md(self, file_content, has_code):
        if has_code:
            return self.read_files_experiment(file_content)
        else:
            return self.read_text(file_content)

    def read_files_experiment(self, file_content):
        snippets = {}  # Snippet to return
        in_snippet = False

        for line in file_content:
            if line.startswith('~'):
                line = line.rstrip().replace("~", '')
                if len(line) > 0:
                    num_side = line.split("-")[0]
                    filename = line.split("-")[1]
                    snippet_number = num_side[0]
                    snippet_side = num_side[1]
                    in_snippet = True
                else:
                    in_snippet = False
                continue

            if in_snippet:  # if is code row
                if snippet_number not in snippets:
                    snippets[snippet_number] = {
                        'L': '',
                        'R': '',
                        'filename': filename,
                        'num_lines_L': 0,
                        'num_lines_R': 0
                    }

                snippets[snippet_number][snippet_side] += line[:-1] + "\\n"
                snippets[snippet_number]['filename'] = filename
                if snippet_side == 'L':
                    snippets[snippet_number]['num_lines_L'] = \
                        snippets[snippet_number]['num_lines_L'] + 1
                else:
                    snippets[snippet_number]['num_lines_R'] = \
                        snippets[snippet_number]['num_lines_R'] + 1
        return snippets

    def read_text(self, file_content):
        body = ''
        element_id = 0  # html dynamic element id for form questions and
        # text areas
        answer_id = 0  # html dynamic element id for check and radio buttons
        in_question = False  # Flag value to understand if the line is part
        # of a question
        is_mandatory = False  # Flag value to understand if almost an answer
        # is required

        untagged = ''
        input_type = ''

        for line in file_content:
            if line.startswith("#RB#"):
                body += f'<fieldset id="fieldset_question_{element_id}" ' \
                    f'class="container_radio_buttons">'
                input_type = 'radio'
                start_char = 5
                if line[4] == '!':
                    is_mandatory = True
                    start_char = 6
                body += mistune.markdown(line[start_char:-1], hard_wrap=True)
                in_question = True

            elif line.startswith("#CB#"):
                body += f'<fieldset id="fieldset_question_{element_id}" ' \
                    f'class="container_checkbox">'
                input_type = 'checkbox'
                start_char = 5
                if line[4] == '!':
                    is_mandatory = True
                    start_char = 6
                body += mistune.markdown(line[start_char:-1], hard_wrap=True)
                in_question = True

            elif line.startswith("#T#"):  # TextArea found
                body += f'<fieldset id="fieldset_question_{element_id}" ' \
                    f'class="container_textarea">'
                start_char = 4
                if line[3] == '!':
                    is_mandatory = True
                    start_char = 5
                body += mistune.markdown(line[start_char:-1], hard_wrap=True)
                body += f'<textarea id="{element_id}" ' \
                    f'name="question_{element_id}" ' \
                    f'form="current_form">'
                if is_mandatory:
                    body = body[:-1] + " required" + body[-1]
                    is_mandatory = False
                body += "</textarea>"
                in_question = True

            elif line.startswith("##") and in_question:
                body += f'<label>' \
                    f'<input type="{input_type}" ' \
                    f'name="question_{element_id}" ' \
                    f'id="q{element_id}a{answer_id}" ' \
                    f'value="{answer_id}"' \
                    f'class="option-input {input_type}">'
                if is_mandatory:
                    body = body[:-1] + " required" + body[-1]
                    is_mandatory = False
                body += mistune.markdown(line[3:-1], hard_wrap=True)[3:-5]
                body += '</label><br>'
                answer_id += 1  # update answer_id
                in_question = True

            elif len(line.rstrip()) == 0:
                if untagged != "":
                    body += mistune.markdown(untagged,
                                             hard_wrap=True)  # Untagged
                    # content
                    untagged = ""
                else:
                    answer_id = 0
                    element_id += 1  # Update element_id
                    body += "</fieldset>"  # Closing question fieldset
                    body += "<br>"

            else:
                untagged += line

        if in_question:
            body += "</fieldset>"
        elif untagged != "":
            body += mistune.markdown(untagged, hard_wrap=True)
            body += '<br>'

        return body