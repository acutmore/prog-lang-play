const input = document.getElementById('input');
const output = document.getElementById('output');

input.onkeyup = () => {
    output.innerText = input.value;
};
