export function StripeDivider({
  color1 = "#E8681E",
  color2 = "#F0A81C",
}: {
  color1?: string;
  color2?: string;
}) {
  return (
    <div
      style={{
        height: 6,
        backgroundImage: `repeating-linear-gradient(-45deg, ${color1}, ${color1} 10px, ${color2} 10px, ${color2} 20px)`,
      }}
    />
  );
}
