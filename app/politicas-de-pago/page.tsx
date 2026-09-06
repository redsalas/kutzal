import Link from 'next/link';

const policies = [
  {
    title: 'Vigencia',
    body: 'Todos los paquetes tienen una vigencia de 30 días naturales a partir de la primera clase utilizada.',
    highlight: '30 días naturales',
  },
  {
    title: 'Clases no utilizadas',
    body: 'Queremos que aproveches cada una de tus clases. Si tu paquete vence y aún tienes clases pendientes, no las pierdes. Al adquirir un nuevo paquete de 8, 12, 16 o 20 clases, tus clases pendientes se reactivarán y podrás utilizarlas durante la vigencia de tu nuevo paquete. Las clases reactivadas podrán utilizarse una sola vez y no podrán acumularse indefinidamente.',
  },
  {
    title: 'Reservaciones',
    body: 'Tu lugar en clase queda asegurado únicamente al realizar tu reservación.',
  },
  {
    title: 'Cancelaciones',
    body: 'Si necesitas cancelar o cambiar tu clase, te pedimos hacerlo con al menos 8 horas de anticipación. Las cancelaciones fuera de este periodo o las clases a las que no asistas se considerarán como utilizadas.',
    highlight: '8 horas de anticipación',
  },
  {
    title: 'Clase muestra',
    body: 'La clase muestra es gratuita y exclusiva para alumnas de nuevo ingreso. Está sujeta a disponibilidad y se permite una sola clase muestra por persona.',
  },
  {
    title: 'Paquetes',
    body: 'Los paquetes son personales e intransferibles y no son reembolsables.',
  },
];

export default function PoliticasDePagoPage() {
  return (
    <div className="min-h-screen bg-grey-50">
      <div className="max-w-2xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-4">
            Kutzal Studio
          </p>
          <div className="text-3xl mb-3">🤍</div>
          <h1 className="text-4xl md:text-5xl font-display italic text-grey-800">
            Políticas de Kutzal
          </h1>
        </div>

        {/* Policy Cards */}
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.title}
              className="bg-white rounded-2xl p-6 border border-grey-200 shadow-sm"
            >
              <h2 className="text-base font-semibold text-grey-800 mb-2">{policy.title}</h2>
              <p className="text-grey-600 leading-relaxed text-sm">{policy.body}</p>
            </div>
          ))}
        </div>

        {/* Link to full policies */}
        <div className="mt-10 text-center">
          <p className="text-grey-500 text-sm mb-4">
            ¿Quieres conocer todas nuestras políticas en detalle?
          </p>
          <Link
            href="/politicas"
            className="inline-block bg-olive-700 hover:bg-olive-800 text-white px-8 py-3 rounded-xl transition-colors duration-200 text-sm font-medium"
          >
            Ver políticas completas
          </Link>
        </div>
      </div>
    </div>
  );
}
