const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Middlewares iniciales
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));


// Index
app.get("/", (req, res)=> {
    res.render("index");
})
app.post("/", (req,res) => {
    const { kpa } = req.body;
    res.redirect(`/form/${kpa}`)
}) 

// Formulario
app.get("/form/:kpa", (req,res)=> {
    // Logica para el formulario
    const kpa = req.params.kpa;
    switch (kpa) {
        case "gestion_requisitos":
            res.render("questionBase", 
                {
                    title: "Gestion de Requisitos", 
                    goals: "Mantener la trazabilidad desde los requisitos iniciales hasta el producto final, garantizando que no se pierdan requisitos durante el ciclo de vida del proyecto",
                    questions: 
                    {
                        1: "¿Se cuenta con un documento o sistema donde se registran todos los requisitos del proyecto?",
                        2: "¿Cada requisito tiene un identificador único que facilita su trazabilidad?",
                        3: "¿Se revisan y validan los requisitos con el cliente antes de su aprobación final?",
                        4: "¿Existen criterios claros para aceptar o rechazar cambios en los requisitos?",
                        5: "¿Se mantiene un registro histórico de cambios y versiones de los requisitos?",
                        6: "¿Se verifica que los cambios en los requisitos sean comunicados a todas las partes interesadas?",
                        7: "¿Cada requisito aprobado está vinculado a componentes de diseño, código o pruebas?",
                        8: "¿El equipo realiza seguimiento continuo para asegurar que los entregables cumplan con los requisitos?",
                        9: "¿Se revisa la consistencia y completitud de los requisitos antes de iniciar el desarrollo?",
                        10: "¿Se utiliza alguna herramienta de trazabilidad o gestión de requisitos (por ejemplo, Jira, DOORS, Trello)?"
                    }
                });
            break;
        case "planificacion_proyectos":
            res.render("questionBase", 
                {
                    title: "Planificación de Proyectos", 
                    goals: "Definir el alcance, objetivos y entregables del proyecto, además de establecer un cronograma con actividades, responsabilidades, fechas y establecer un marco de seguimiento y control durante la ejecuccion del proyecto.",
                    questions: 
                    {
                        1: "¿Existe un plan de proyecto formalmente documentado y aprobado por la dirección o cliente?",
                        2: "¿El plan de proyecto incluye estimaciones de esfuerzo, cronograma, costos y recursos humanos?",
                        3: "¿Se identifican las dependencias entre tareas y se reflejan en el cronograma?",
                        4: "¿Se definen claramente los roles y responsabilidades de cada miembro del equipo?",
                        5: "¿Se han identificado y analizado los riesgos del proyecto junto con estrategias de mitigación?",
                        6: "¿El plan contempla hitos y entregables claramente definidos y medibles?",
                        7: "¿El plan se actualiza cuando ocurren cambios significativos en el alcance o recursos?",
                        8: "¿Se establecen mecanismos para revisar y aprobar el plan antes de su ejecución?",
                        9: "¿El equipo tiene acceso y conoce el contenido del plan de proyecto?",
                        10: "¿Se realiza una planificación de recursos (humanos, técnicos, financieros) acorde a los objetivos del proyecto?"
                    }
                }
            );
            break;
        case "seguimiento_control":
            res.render("questionBase",
                {
                    title: "Seguimiento de Control",
                    goals: "Surpervisar que se van cumpliendo las metas propuestas en las fechas especificadas, y que no haya ningún imprevisto",
                    questions:
                    {
                        1: "¿Qué plan de mitigación este listo para ser activado?",
                        2: "¿Cual es el valor actual de este indicador y como se compara con la meta que habiamos definido?",
                        3: "¿Que acciones o factores específicos están impulsando el resultado actual?",
                        4: "Basandonos en el ritmo de progreso actual, ¿existe un riesgo alto de no alcanzar la meta para el final del periodo de medición?",
                        5: "¿Hay alguna restricción operativa, cuello de botella o alguna dependencia crítica que limite la mejora de este resultado?",
                        6: "Si el resultado no cumple con la meta establecida, ¿cuál es la acción de contención inmediata que se va a llevar a cabo y quien es el responsable de hacerlo?",
                        7: "¿La variación de este resultado se debe a un problema de capacidad o de calidad?",
                        8: "Si tuvieramos que simplificar el proceso para mejorar el resultado, ¿qué paso podríamos eliminar o automatizar sin comprometer la calidad?",
                        9: "¿Cómo ha evolucionado este resultado en los últimos periodos y es esa la tendencia consistente con lo esperado?",
                        10: "¿Como se comportan los resultados al desglosarlos por las categorias clave, y dónde observamos mayor disparidad?"
                    }
                }
            );
            
            break;
        case "gestion_configuracion":
            res.render("questionBase",
                {
                    title: "Gestión de Configuración",
                    goals: "Identificar y controlar el estado junto con la verficicación de los elementos del hardware, software, documentación y servicios",
                    questions:
                    {
                        1: "¿Cuál es el porcentaje actual de los elementos que están completamente documentados y vinculados al repositorio central?",
                        2: "¿Cuántos cambios no autorizados o desviaciones se han detectado en el último periodo y que impacto tienen?",
                        3: "¿Cuál es el tiempo promedio que se tarda en identificar, aprobar e implementar una solicitud de cambio estandar?",
                        4: "¿Existe un desajuste o disparidad entre la configuración lógica y la configuración física para los Elementos de Configuración?",
                        5: "¿Cuántos fallos o incidentes han sido causados directamente por información de configuración incorrecta en el ultimo mes?",
                        6: "¿El proceso de gestión de la configuración está logrando evitar la deriva de configuraciónen los entornos de producción y preproducción?",
                        7: "¿Se han asigando roles y responsabilidades de manera clara y se están respetando para hacer cambios?",
                        8: "Si tenemos que revertir a una actualización anterior, ¿cuánto tardariamos en ejeciutar la restauración?",
                        9: "¿Se ha completado la auditoría programada de la linea base, pala los elementos críticos de este ciclo?",
                        10: "¿Se ha realizado una revisión de los elementos de configuración obsoletos, para retirarlos del inventario y reducir la complejidad, y el costo de mantenimiento?"
                    }
                }                      
            );
            break;
        case "aseguramiento_calidad":
            res.render("questionBase",
                {
                    title: "Aseguramiento de calidad",
                    goals: "Garantizar que los productos, servicios y procesos del proyecto cumplan consistentemente con los requisitos y estándares definidos, mediante la planificación, monitoreo, verificación y mejora continua de las actividades de calidad.",
                    questions:
                    {
                        1: "¿Existe un plan de aseguramiento de calidad documentado que describa los procesos, estándares y métricas a seguir para cada proyecto?",
                        2: "¿Se realizan revisiones periódicas de los productos y procesos para asegurar que cumplan con los requisitos y estándares establecidos?",
                        3: "¿Se identifican y registran las desviaciones de calidad y se implementan acciones correctivas de manera documentada?",
                        4: "¿Se lleva un seguimiento formal del estado de los problemas de calidad hasta su resolución?",
                        5: "¿Los equipos de proyecto reciben formación o capacitación en los procesos y estándares de calidad definidos?",
                        6: "¿Se asegura que los proveedores externos cumplan con los estándares de calidad acordados?",
                        7: "¿Existen registros de auditorías o revisiones de calidad y se usan como insumo para mejorar los procesos?",
                        8: "¿Se monitorean y reportan métricas de calidad durante el desarrollo del proyecto (por ejemplo, defectos encontrados, cumplimiento de estándares)?",
                        9: "¿Se planifican y ejecutan actividades de verificación y validación de productos de manera consistente con los objetivos del proyecto?",
                        10: "¿El aseguramiento de calidad participa activamente en revisiones de hitos críticos para garantizar la conformidad con los criterios de aceptación?"
                    },
                }                      
            );
            
            break;
        default:
            res.send("[ERROR] KPA: "+kpa+" NO ENCONTRADA")
    }
})

// Procesar informacion
app.post("/processingResults", (req,res)=> {
    const respuestas = req.body;
    const comments = {parcial: [], sinImplementar: [], percent:0};
    const sugerencias = 
    {
        "¿Existe un plan de aseguramiento de calidad documentado que describa los procesos, estándares y métricas a seguir para cada proyecto?": "Documentar un plan de aseguramiento de calidad para cada proyecto, incluyendo roles, responsabilidades, estándares aplicables y métricas de seguimiento.",
        "¿Se realizan revisiones periódicas de los productos y procesos para asegurar que cumplan con los requisitos y estándares establecidos?": "Programar revisiones periódicas y checkpoints de calidad; usar listas de verificación y registros de hallazgos para asegurar el cumplimiento.",
        "¿Se identifican y registran las desviaciones de calidad y se implementan acciones correctivas de manera documentada?": "Establecer un sistema de registro de desviaciones, asignación de responsables y seguimiento de acciones correctivas hasta su cierre.",
        "¿Se lleva un seguimiento formal del estado de los problemas de calidad hasta su resolución?": "Implementar una herramienta o método de seguimiento de problemas de calidad que permita registrar, asignar y dar seguimiento a cada incidencia.",
        "¿Los equipos de proyecto reciben formación o capacitación en los procesos y estándares de calidad definidos?": "Planificar y ejecutar capacitaciones sobre procesos y estándares de calidad; evaluar la comprensión del personal mediante cuestionarios o ejercicios prácticos.",
        "¿Se asegura que los proveedores externos cumplan con los estándares de calidad acordados?": "Definir criterios de calidad para proveedores y realizar auditorías o revisiones periódicas de su desempeño conforme a los estándares acordados.",
        "¿Existen registros de auditorías o revisiones de calidad y se usan como insumo para mejorar los procesos?": "Mantener un repositorio de auditorías y revisiones de calidad, documentando hallazgos, recomendaciones y acciones de mejora aplicadas.",
        "¿Se monitorean y reportan métricas de calidad durante el desarrollo del proyecto (por ejemplo, defectos encontrados, cumplimiento de estándares)?": "Definir métricas clave de calidad y establecer reportes periódicos para monitorear desempeño, tendencias de defectos y cumplimiento de estándares.",
        "¿Se planifican y ejecutan actividades de verificación y validación de productos de manera consistente con los objetivos del proyecto?": "Diseñar un plan de verificación y validación que incluya pruebas, inspecciones y revisiones, asegurando cobertura de todos los requisitos críticos.",
        "¿El aseguramiento de calidad participa activamente en revisiones de hitos críticos para garantizar la conformidad con los criterios de aceptación?": "Involucrar al equipo de QA en todas las revisiones de hitos, asegurando la verificación de entregables y la conformidad con criterios de aceptación establecidos.",
        "¿Se cuenta con un documento o sistema donde se registran todos los requisitos del proyecto?": "Implementar un repositorio centralizado de requisitos accesible para todo el equipo de proyecto.",
        "¿Cada requisito tiene un identificador único que facilita su trazabilidad?": "Asignar un ID único a cada requisito para permitir su seguimiento durante diseño, desarrollo y pruebas.",
        "¿Se revisan y validan los requisitos con el cliente antes de su aprobación final?": "Programar sesiones de revisión con el cliente y documentar su aprobación formal de cada requisito.",
        "¿Existen criterios claros para aceptar o rechazar cambios en los requisitos?": "Definir un proceso formal de gestión de cambios con criterios de evaluación y aprobación de cada modificación.",
        "¿Se mantiene un registro histórico de cambios y versiones de los requisitos?": "Registrar todas las versiones y cambios de requisitos con fecha, responsable y motivo del cambio.",
        "¿Se verifica que los cambios en los requisitos sean comunicados a todas las partes interesadas?": "Establecer un mecanismo de notificación automática o manual a todos los interesados sobre cambios aprobados.",
        "¿Cada requisito aprobado está vinculado a componentes de diseño, código o pruebas?": "Mantener trazabilidad de requisitos hasta diseño, desarrollo y pruebas, asegurando cobertura completa.",
        "¿El equipo realiza seguimiento continuo para asegurar que los entregables cumplan con los requisitos?": "Implementar revisiones periódicas de entregables y métricas de cumplimiento de requisitos.",
        "¿Se revisa la consistencia y completitud de los requisitos antes de iniciar el desarrollo?": "Realizar revisiones formales para detectar inconsistencias, omisiones o duplicaciones antes de comenzar el desarrollo.",
        "¿Se utiliza alguna herramienta de trazabilidad o gestión de requisitos (por ejemplo, Jira, DOORS, Trello)?": "Seleccionar y configurar una herramienta que permita registrar, vincular y rastrear todos los requisitos.",
        "¿Existe un plan de proyecto formalmente documentado y aprobado por la dirección o cliente?": "Documentar y obtener aprobación formal del plan de proyecto antes del inicio de actividades.",
        "¿El plan de proyecto incluye estimaciones de esfuerzo, cronograma, costos y recursos humanos?": "Incluir todas las estimaciones clave en el plan y validar su consistencia con los objetivos del proyecto.",
        "¿Se identifican las dependencias entre tareas y se reflejan en el cronograma?": "Mapear dependencias y reflejarlas en el cronograma para asegurar coordinación y secuencia adecuada de actividades.",
        "¿Se definen claramente los roles y responsabilidades de cada miembro del equipo?": "Asignar y documentar responsabilidades y roles para cada actividad del proyecto.",
        "¿Se han identificado y analizado los riesgos del proyecto junto con estrategias de mitigación?": "Mantener un registro de riesgos con análisis de impacto, probabilidad y planes de mitigación.",
        "¿El plan contempla hitos y entregables claramente definidos y medibles?": "Definir hitos y entregables con criterios de aceptación claros y medibles.",
        "¿El plan se actualiza cuando ocurren cambios significativos en el alcance o recursos?": "Establecer un procedimiento de actualización del plan ante cambios de alcance, cronograma o recursos.",
        "¿Se establecen mecanismos para revisar y aprobar el plan antes de su ejecución?": "Implementar revisiones formales de aprobación del plan por la dirección y partes interesadas.",
        "¿El equipo tiene acceso y conoce el contenido del plan de proyecto?": "Distribuir el plan a todo el equipo y asegurar que comprendan su contenido y responsabilidades.",
        "¿Se realiza una planificación de recursos (humanos, técnicos, financieros) acorde a los objetivos del proyecto?": "Planificar y asignar recursos de manera óptima según cronograma, requerimientos y capacidades disponibles.",
        "¿Qué plan de mitigación este listo para ser activado?": "Tener planes de mitigación documentados y accesibles para cada riesgo crítico identificado.",
        "¿Cual es el valor actual de este indicador y como se compara con la meta que habiamos definido?": "Medir regularmente los indicadores clave y compararlos con las metas definidas para detectar desviaciones.",
        "¿Que acciones o factores específicos están impulsando el resultado actual?": "Analizar causas raíz y documentar acciones correctivas o preventivas según corresponda.",
        "Basandonos en el ritmo de progreso actual, ¿existe un riesgo alto de no alcanzar la meta para el final del periodo de medición?": "Evaluar riesgos de desempeño y ajustar planes para asegurar cumplimiento de objetivos.",
        "¿Hay alguna restricción operativa, cuello de botella o alguna dependencia crítica que limite la mejora de este resultado?": "Identificar limitaciones y priorizar acciones para eliminarlas o mitigarlas.",
        "Si el resultado no cumple con la meta establecida, ¿cuál es la acción de contención inmediata que se va a llevar a cabo y quien es el responsable de hacerlo?": "Definir acciones de contención rápidas con responsables claros y plazos específicos.",
        "¿La variación de este resultado se debe a un problema de capacidad o de calidad?": "Analizar causas de variaciones y documentar si provienen de capacidad, calidad o ambos.",
        "Si tuvieramos que simplificar el proceso para mejorar el resultado, ¿qué paso podríamos eliminar o automatizar sin comprometer la calidad?": "Revisar procesos para identificar pasos innecesarios y proponer automatización o simplificación.",
        "¿Cómo ha evolucionado este resultado en los últimos periodos y es esa la tendencia consistente con lo esperado?": "Registrar tendencias históricas de resultados y compararlas con expectativas para ajustes proactivos.",
        "¿Como se comportan los resultados al desglosarlos por las categorias clave, y dónde observamos mayor disparidad?": "Analizar resultados por categorías, detectar disparidades y enfocar mejoras donde sea necesario.",
        "¿Cuál es el porcentaje actual de los elementos que están completamente documentados y vinculados al repositorio central?": "Medir cobertura de documentación y asegurar que todos los elementos estén correctamente registrados en el repositorio central.",
        "¿Cuántos cambios no autorizados o desviaciones se han detectado en el último periodo y que impacto tienen?": "Registrar desviaciones y evaluar su impacto para acciones correctivas y preventivas.",
        "¿Cuál es el tiempo promedio que se tarda en identificar, aprobar e implementar una solicitud de cambio estandar?": "Medir y optimizar los tiempos de gestión de cambios para mejorar eficiencia y control.",
        "¿Existe un desajuste o disparidad entre la configuración lógica y la configuración física para los Elementos de Configuración?": "Realizar auditorías de configuración para identificar y corregir discrepancias entre elementos planificados y reales.",
        "¿Cuántos fallos o incidentes han sido causados directamente por información de configuración incorrecta en el ultimo mes?": "Analizar incidentes y tomar medidas para reducir errores de configuración en futuros ciclos.",
        "¿El proceso de gestión de la configuración está logrando evitar la deriva de configuración en los entornos de producción y preproducción?": "Monitorear consistencia de entornos y corregir desviaciones para evitar deriva de configuración.",
        "¿Se han asignado roles y responsabilidades de manera clara y se están respetando para hacer cambios?": "Definir responsabilidades de cambio claramente y asegurar cumplimiento mediante seguimiento.",
        "Si tenemos que revertir a una actualización anterior, ¿cuánto tardaríamos en ejecutar la restauración?": "Definir procedimientos de restauración y tiempos de respuesta para minimizar impacto en producción.",
        "¿Se ha completado la auditoría programada de la línea base, para los elementos críticos de este ciclo?": "Realizar auditorías de línea base según cronograma y documentar hallazgos y acciones correctivas.",
        "¿Se ha realizado una revisión de los elementos de configuración obsoletos, para retirarlos del inventario y reducir la complejidad, y el costo de mantenimiento?": "Revisar periódicamente elementos obsoletos y retirarlos del inventario para optimizar costos y simplificar gestión."
    }

    let totalSum = 0;
    // Paso 1: Recorremos el Objeto
    Object.keys(respuestas).forEach(key => {
        console.log(`${key}: ${respuestas[key]}`);
        // Paso 2: Identificamos la respuesta
        switch (respuestas[key]) {
            case "cumple":
                totalSum += 10;
                break;
            case "parcial":
                totalSum += 5;
                comments.parcial.push(sugerencias[key]);
                break;
            case "no_cumple":
                comments.sinImplementar.push(sugerencias[key]);
                break;
        }
    })
    // Paso 3: Realizar la media y almacenar en el objeto
    const numPreguntas = Object.keys(respuestas).length;
    comments.percent = (totalSum / (numPreguntas * 10)) * 100; 

    res.render("results", comments);
})

// Inicializacion del servidor
app.listen(PORT, ()=>{
    console.log("Escuchando en el puerto:", PORT);
    console.log(`http://localhost:${PORT}`);
})
