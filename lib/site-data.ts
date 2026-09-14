export type Noticia = {
  id: number | string;
  fecha: string;
  titulo: string;
  lugar: string;
  contenido: string;
  imagen: string;
  imagenAlt: string;
};

export const noticiasIniciales: Noticia[] = [
  {
    id: 1,
    fecha: "2026-07-08",
    titulo: "Servicio de Cedulación a Domicilio",
    lugar: "Santa María - Misiones",
    contenido:
      "Funcionarios de la Oficina Regional del Departamento de Identificaciones de San Ignacio realizaron un servicio de cedulación a domicilio para garantizar el derecho a la identidad de una persona en situación de cama, reafirmando el compromiso institucional con la comunidad.",
    imagen: "/img/noticias/santa-maria-08072026.jpg",
    imagenAlt: "Cedulación a domicilio en Santa María, Misiones",
  },
];
