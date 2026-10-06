// Wave Music · DEMO
// Same song, lyrics and Whisper-measured timestamps as the FakeChat
// compositions (src/scenes/FakeChatScene.tsx), so the demo sounds right
// out of the box.
(function (WM) {
  WM.ASSETS = {
    background: "../fake-chat/background.png",
  };

  WM.DEMO = {
    audioSrc: "../fake-chat/song.mp3",
    audioName: "Canción de amor · demo",
    lyrics: [
      "Estoy tratando de decirte que...",
      "Me desespero de esperarte",
      "Que no salgo a buscarte porque sé...",
      "Que corro el riesgo de encontrarte",
      "Que me sigo mordiendo noche y día las uñas del rencor",
      "Que te sigo debiendo todavía una canción de amor",
    ].join("\n"),
    // Test timestamps (seconds), one per line.
    starts: [1.66, 7.44, 11.88, 15.74, 20.82, 28.78],
  };
})((window.WaveMusic = window.WaveMusic || {}));
