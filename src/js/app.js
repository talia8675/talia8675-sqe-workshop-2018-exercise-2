import $ from 'jquery';
import {parseCode, itercode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        //$('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let inputsToPars = $('#inputsPlaceholder').val();
        let parsedInputs = parseCode(inputsToPars);
        let pCode = document.getElementById('parsedCode');
        let rows = itercode(parsedCode,parsedInputs);
        pCode.innerHTML = '';
        for(let i=0; i<rows.length; i++) {
            if(rows[i].Color == 'red')
                pCode.innerHTML +='<span style="color:red;"> '+ rows[i].Line + '</span><br>';
            else if(rows[i].Color == 'green')
                pCode.innerHTML += '<span style="color:green;"> '+ rows[i].Line + '\n</span><br>';
            else pCode.innerHTML += '<span style="color:black;"> '+ rows[i].Line + '\n</span><br>';
        }
        //$('#parsedCode').val(JSON.stringify(itercode(parsedCode)));
    });
});

