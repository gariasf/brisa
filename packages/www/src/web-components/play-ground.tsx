import { type WebContext } from 'brisa';

const defaultValue = ` export default function Counter({ name }: any, { state }: any) {
  const count = state(0);

  return (
    <p>
      <button onClick={() => count.value++}>+</button>
      <span> {name} {count.value} </span>
      <button onClick={() => count.value--}>-</button>
    </p>
  )
}`;

export default async function PlayGround(
  {},
  { state, css, cleanup, onMount }: WebContext,
) {
  const code = state<string>('');
  const iframeRef = state<HTMLIFrameElement | null>(null);

  function onReceiveCompiledCode(e: MessageEvent) {
    if (e.data.ready) sendDefaultCode();
    if (typeof e.data?.code === 'string') {
      code.value = e.data.code;
    }
  }

  function sendDefaultCode() {
    iframeRef.value!.contentWindow?.postMessage({ code: defaultValue });
  }

  onMount(() => {
    window.addEventListener('message', onReceiveCompiledCode);
  });

  cleanup(() => {
    window.removeEventListener('message', onReceiveCompiledCode);
  });

  function onInput(e: Event) {
    iframeRef.value!.contentWindow?.postMessage({
      code: (e.target as HTMLInputElement).value,
    });
  }

  css`
    .playground {
      display: flex;
      gap: 1rem;
      margin: 50px;
    }

    .output {
      width: 100%;
    }

    .wc {
      border: 1px solid #ccc;
      border-radius: 0.5rem;
      padding: 1rem;
      background-color: #f9f9f9;
    }

    .original-code {
      width: 100%;
    }

    textarea {
      width: 100%;
      field-sizing: content;
      height: auto;
      font-size: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #ccc;
    }
  `;

  return (
    <section class="playground">
      <div class="original-code">
        <h2>Original code:</h2>
        <textarea onInput={onInput}>{defaultValue}</textarea>
      </div>
      <div class="output">
        <h2>Web Component:</h2>
        <iframe ref={iframeRef} src="/playground/preview" />
        <h2>Compiled Code:</h2>
        <textarea disabled>{code.value}</textarea>
      </div>
    </section>
  );
}
