export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-4">
            Kutzal Studio
          </p>
          <h1 className="text-4xl md:text-5xl font-display italic text-grey-800">
            Políticas de Kutzal
          </h1>
          <p className="mt-4 text-grey-500 text-base leading-relaxed">
            En Kutzal queremos que cada clase sea un espacio de movimiento,
            conexión y bienestar. Para cuidar tu experiencia y la de toda
            nuestra comunidad, te pedimos leer y considerar las siguientes
            políticas.
          </p>
        </div>

        {/* Policies */}
        <div className="space-y-10">
          <PolicySection number="1" title="Paquetes y vigencia">
            <p>
              Todos nuestros paquetes son{" "}
              <strong>personales e intransferibles</strong> y cuentan con una
              vigencia de <strong>30 días naturales</strong> a partir de la
              primera clase utilizada.
            </p>
            <p>
              Los paquetes no son reembolsables ni transferibles a otra persona.
            </p>
          </PolicySection>

          <PolicySection number="2" title="Clases pendientes">
            <p>
              Queremos que aproveches cada una de tus clases. Si al finalizar la
              vigencia de tu paquete tienes clases pendientes,{" "}
              <strong>no las perderás</strong>.
            </p>
            <p>
              Al adquirir un nuevo paquete de{" "}
              <strong>8, 12, 16 o 20 clases</strong>, tus clases pendientes
              serán reactivadas automáticamente.
            </p>
            <p>
              Las clases reactivadas deberán utilizarse durante la vigencia del
              nuevo paquete y{" "}
              <strong>no podrán acumularse indefinidamente</strong>.
            </p>
          </PolicySection>

          <PolicySection number="3" title="Reservaciones">
            <p>
              Todas las clases requieren <strong>reservación previa</strong> y
              están sujetas a disponibilidad.
            </p>
            <p>
              Tu lugar en clase queda confirmado una vez realizada la
              reservación correspondiente.
            </p>
            <p>
              Te recomendamos reservar tus clases con anticipación para asegurar
              el horario de tu preferencia.
            </p>
          </PolicySection>

          <PolicySection number="4" title="Cancelaciones y cambios">
            <p>
              Si necesitas cancelar o cambiar una reservación, deberás hacerlo
              con un mínimo de <strong>8 horas de anticipación</strong>.
            </p>
            <p>
              Las cancelaciones realizadas fuera de este periodo, así como las
              inasistencias, serán consideradas como una clase utilizada y{" "}
              <strong>no podrán recuperarse</strong>.
            </p>
            <p>
              En caso de una situación extraordinaria, escríbenos para revisar
              tu caso de manera individual.
            </p>
          </PolicySection>

          <PolicySection number="5" title="Clase muestra">
            <p>
              La <strong>clase muestra es gratuita</strong> y está disponible
              exclusivamente para personas que nunca hayan tomado una clase en
              Kutzal.
            </p>
            <p>
              La clase muestra es válida por una sola ocasión, está sujeta a
              disponibilidad y requiere reservación previa.
            </p>
          </PolicySection>

          <PolicySection number="6" title="Puntualidad">
            <p>
              Te recomendamos llegar <strong>5 a 10 minutos antes</strong> de tu
              clase para prepararte con calma.
            </p>
            <p>
              Por respeto al grupo y al desarrollo de la sesión, el ingreso
              podrá limitarse una vez iniciada la clase.
            </p>
            <p>
              Si llegas tarde, el coach determinará si es seguro incorporarte a
              la sesión.
            </p>
          </PolicySection>

          <PolicySection number="7" title="Uso del equipo">
            <p>El equipo de Kutzal es de uso compartido y requiere cuidado.</p>
            <p>
              Te pedimos utilizar los reformers y accesorios siguiendo las
              indicaciones de tu coach y reportar cualquier anomalía o daño
              antes de comenzar tu clase.
            </p>
          </PolicySection>

          <PolicySection number="8" title="Seguridad y bienestar">
            <p>
              Es responsabilidad de cada alumna informar al coach sobre
              cualquier lesión, condición física, embarazo o circunstancia que
              pueda afectar la práctica de Pilates antes de iniciar la clase.
            </p>
            <p>
              Si durante la sesión presentas dolor, mareo o cualquier molestia
              fuera de lo habitual, comunícaselo inmediatamente a tu coach.
            </p>
            <p>
              Kutzal busca ofrecer un espacio seguro, pero cada persona es
              responsable de conocer y respetar sus propios límites físicos.
            </p>
          </PolicySection>

          <PolicySection number="9" title="Objetos personales">
            <p>
              Kutzal no se hace responsable por la pérdida, daño o extravío de
              objetos personales dentro de las instalaciones.
            </p>
            <p>
              Te recomendamos traer únicamente lo necesario y mantener tus
              pertenencias en los espacios destinados para ello.
            </p>
          </PolicySection>

          <PolicySection
            number="10"
            title="Pagos y seguridad de la información"
          >
            <p>
              Los pagos realizados para adquirir clases o paquetes en Kutzal se
              procesan a través de
              <strong> Stripe</strong>, nuestro proveedor externo de servicios
              de pago.
            </p>

            <p>
              Al realizar un pago, la información necesaria para procesar la
              transacción, incluyendo los datos de tu tarjeta bancaria, es
              ingresada y procesada directamente mediante la infraestructura
              segura de Stripe.{" "}
              <strong>
                Kutzal no almacena ni tiene acceso a los datos completos de tu
                tarjeta
              </strong>
              , como el número completo, código de seguridad (CVV/CVC) o fecha
              de vencimiento.
            </p>

            <p>
              Kutzal únicamente recibe la información necesaria para identificar
              y confirmar el resultado de la transacción, así como la
              información relacionada con la compra, con el propósito de activar
              y administrar el paquete o servicio adquirido.
            </p>

            <p>
              El procesamiento, almacenamiento y protección de los datos
              relacionados con la tarjeta se encuentran sujetos a las políticas
              y medidas de seguridad de Stripe. Al utilizar nuestro sistema de
              pago, también aceptas los términos y políticas aplicables de dicho
              proveedor.
            </p>

            <p>
              Kutzal no solicita por medios como WhatsApp, correo electrónico,
              mensajes de texto o redes sociales fotografías de tarjetas,
              números completos de tarjeta, códigos CVV/CVC ni contraseñas
              bancarias.{" "}
              <strong>
                No envíes este tipo de información por dichos medios.
              </strong>
            </p>

            <p>
              Una vez realizado el pago, los paquetes son personales,
              intransferibles y no reembolsables, salvo que exista una excepción
              expresamente comunicada por Kutzal o que resulte aplicable
              conforme a la legislación correspondiente.
            </p>
          </PolicySection>

          <PolicySection number="11" title="Modificaciones">
            <p>
              Kutzal se reserva el derecho de realizar modificaciones a
              horarios, clases, precios y políticas cuando sea necesario.
            </p>
            <p>
              Cualquier cambio relevante será comunicado oportunamente a nuestra
              comunidad.
            </p>
          </PolicySection>
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-10 border-t border-grey-200 text-center">
          <p className="text-2xl mb-4">🤍</p>
          <p className="text-grey-700 font-medium text-lg mb-2">
            Gracias por ser parte de Kutzal
          </p>
          <p className="text-grey-500 leading-relaxed">
            Estas políticas existen para cuidar nuestros espacios, nuestro
            equipo y, sobre todo,{" "}
            <strong>
              el proceso de cada persona que forma parte de nuestra comunidad
            </strong>
            . Gracias por ayudarnos a construir un estudio donde podamos
            movernos, conectar y crecer juntas.
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-olive-200 pl-6">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-xs font-semibold tracking-widest text-olive-500 uppercase">
          {number}.
        </span>
        <h2 className="text-xl font-semibold text-grey-800">{title}</h2>
      </div>
      <div className="space-y-2 text-grey-600 leading-relaxed">{children}</div>
    </div>
  );
}
