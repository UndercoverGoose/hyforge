const error_container = document.getElementsByClassName('error-notifs')[0]!;

export default function error(header: string, text: string) {
  const div = document.createElement('div');
  div.innerHTML = `${header ? `<b>${header}: </b>` : ''}${text}`;
  error_container.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 6666);
  return new Error(text);
}
