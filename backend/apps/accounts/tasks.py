from celery import shared_task


@shared_task
def send_password_reset_email(email, reset_link):
    from .services import send_email_safely

    subject = "Restablecer contraseña - Seba Yoga"
    message = (
        "Hola,\n\n"
        "Recibimos una solicitud para restablecer tu contraseña.\n\n"
        f"Ingresá a este enlace para crear una nueva contraseña:\n{reset_link}\n\n"
        "Si no lo solicitaste vos, podés ignorar este correo.\n\n"
        "Namasté,\nSeba Yoga"
    )
    send_email_safely(subject, message, email)