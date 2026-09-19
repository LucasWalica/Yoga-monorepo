from django.db import migrations

ACHIEVEMENTS = [
    ("first_step", "Primer paso", "Completaste tu primera práctica o clase.", "Baby", 1),
    ("classes_1", "Primera clase", "Asististe a tu primera clase en vivo.", "Users", 2),
    ("classes_10", "Rutina", "Asististe a 10 clases en vivo.", "CalendarCheck", 3),
    ("warrior_20", "Guerrero", "Asististe a 20 clases en vivo.", "Swords", 4),
    ("meditation_5", "Mente tranquila", "Completaste 5 meditaciones.", "Brain", 5),
    ("pomodoro_10", "Enfoque total", "Completaste 10 pomodoros de estudio.", "Timer", 6),
    ("streak_3", "Momentum", "3 días seguidos de práctica.", "Flame", 7),
    ("streak_7", "Semana zen", "7 días seguidos de práctica.", "CalendarHeart", 8),
    ("streak_14", "Disciplina", "14 días seguidos de práctica.", "Trophy", 9),
    ("streak_30", "Un mes en calma", "30 días seguidos de práctica. Increíble.", "Crown", 10),
    ("minutes_60", "Una hora contigo", "Acumulaste 60 minutos de práctica.", "Clock", 11),
    ("minutes_300", "Cinco horas", "Acumulaste 5 horas de práctica.", "Hourglass", 12),
    ("minutes_1000", "Mil minutos", "Acumulaste 1000 minutos de práctica.", "Star", 13),
]


def forwards(apps, schema_editor):
    Achievement = apps.get_model("gamification", "Achievement")
    for i, (code, title, description, icon, order) in enumerate(ACHIEVEMENTS):
        Achievement.objects.update_or_create(
            code=code,
            defaults={
                "title": title,
                "description": description,
                "icon": icon,
                "order": i,
            },
        )


def backwards(apps, schema_editor):
    Achievement = apps.get_model("gamification", "Achievement")
    Achievement.objects.filter(
        code__in=[code for code, *_ in ACHIEVEMENTS]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("gamification", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]